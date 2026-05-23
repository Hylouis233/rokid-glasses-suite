import type { IncomingMessage, ServerResponse } from "node:http";
import type { LingzhuRequest } from "./types.js";
import type { LingzhuConfig } from "./types.js";
import {
  lingzhuToOpenAI,
  openaiChunkToLingzhu,
  formatLingzhuSSE,
  createFollowUpResponse,
  extractFollowUpFromText,
} from "./transform.js";

/**
 * 验证 Authorization 头
 */
function verifyAuth(
  authHeader: string | string[] | undefined,
  expectedAk: string
): boolean {
  if (!expectedAk) {
    // 未配置 AK 时跳过验证
    return true;
  }

  const header = Array.isArray(authHeader) ? authHeader[0] : authHeader;
  if (!header) return false;

  return header === `Bearer ${header.startsWith("Bearer ") ? expectedAk : expectedAk}`; // Normalization check: if it already has Bearer, we just compare
}

/**
 * 读取 JSON 请求体
 */
async function readJsonBody(req: IncomingMessage): Promise<any> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const body = Buffer.concat(chunks).toString("utf-8");
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", (e) => reject(e));
  });
}

/**
 * 创建 HTTP 处理器
 */
export function createHttpHandler(api: any, getConfig: () => LingzhuConfig) {
  return async function handler(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
    const url = new URL(req.url ?? "/", "http://localhost");
    if (url.pathname !== "/metis/agent/api/sse") {
      return false; // 不处理该路径，由后续处理器处理
    }

    if (req.method !== "POST") {
      res.statusCode = 405;
      res.end("Method Not Allowed");
      return true;
    }

    const logger = api.logger;
    const runtime = api.runtime;
    const config = getConfig();

    // 验证鉴权
    const authHeader = req.headers.authorization;
    if (!verifyAuth(authHeader, config.authAk || "")) {
      logger.warn("[Lingzhu] Unauthorized request");
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Unauthorized" }));
      return true;
    }

    let heartbeatTimer: ReturnType<typeof setInterval> | undefined;

    try {
      // 解析请求体
      const body = await readJsonBody(req) as LingzhuRequest | undefined;
      if (!body || !body.message_id || !body.agent_id || !Array.isArray(body.message)) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            error: "Missing required fields: message_id, agent_id, message",
          })
        );
        return true;
      }

      logger.info(
        `[Lingzhu] Request: message_id=${body.message_id}, agent_id=${body.agent_id}, message=${JSON.stringify(body.message)}`
      );

      // 设置 SSE 响应头
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");

      // 转换消息格式
      const openaiMessages = lingzhuToOpenAI(
        body.message,
        body.metadata?.context
      );

      // 兜底：如果转换后没有 user message，尝试从原始消息中提取文本
      const hasUserMsg = openaiMessages.some((m) => m.role === "user");
      if (!hasUserMsg) {
        // 尝试从 body.message 中提取任何文本内容
        const fallbackText = body.message
          .map((m: any) => m.text || m.content || "")
          .filter(Boolean)
          .join(" ");
        if (fallbackText) {
          openaiMessages.push({ role: "user", content: fallbackText });
        } else {
          // 最后兜底：用 "你好" 避免 400 错误
          openaiMessages.push({ role: "user", content: "你好" });
        }
        logger.warn(`[Lingzhu] No user message after transform, fallback: ${fallbackText || "你好"}`);
      }

      // 使用固定 session key，让所有灵珠请求共享同一个 agent session（保持上下文）
      const sessionKey = `lingzhu:${config.agentId || "luna"}:default`;

      // 获取 gateway 端口和 token
      const gatewayPort = api.config?.gateway?.port ?? 18789;
      const gatewayToken = api.config?.gateway?.auth?.token;

      // 调用 OpenClaw /v1/chat/completions API
      const agentId = config.agentId || "luna";
      const openclawUrl = `http://127.0.0.1:${gatewayPort}/v1/chat/completions`;
      const openclawBody = {
        model: `openclaw:${agentId}`,
        stream: true,
        messages: openaiMessages,
        user: sessionKey,
      };

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-openclaw-agent-id": agentId,
        "x-openclaw-session-key": sessionKey,
      };
      if (gatewayToken) {
        headers["Authorization"] = `Bearer ${gatewayToken}`;
      }

      logger.info(`[Lingzhu] Calling OpenClaw: ${openclawUrl}, agentId=${agentId}, sessionKey=${sessionKey}, model=${openclawBody.model}`);

      const openclawResponse = await fetch(openclawUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(openclawBody),
      });

      if (!openclawResponse.ok) {
        const errorText = await openclawResponse.text();
        throw new Error(`OpenClaw API error: ${openclawResponse.status} - ${errorText}`);
      }

      // 收集完整响应用于提取 follow_up
      let fullResponse = "";
      let hasToolCall = false;
      let lastDataTime = Date.now();
      const HEARTBEAT_INTERVAL = 12000; // 12秒发一次心跳

      // 心跳定时器：防止灵珠平台 SSE 超时断连
      heartbeatTimer = setInterval(() => {
        const elapsed = Date.now() - lastDataTime;
        if (elapsed >= HEARTBEAT_INTERVAL) {
          try {
            // 发送 SSE 注释作为心跳（灵珠平台会忽略注释行但保持连接）
            res.write(": heartbeat\n\n");
            logger.info(`[Lingzhu] Sent heartbeat (${Math.round(elapsed / 1000)}s since last data)`);
          } catch {
            // 连接已关闭，清理定时器
            clearInterval(heartbeatTimer);
          }
        }
      }, HEARTBEAT_INTERVAL);

      // 流式解析 OpenAI SSE
      const reader = openclawResponse.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        lastDataTime = Date.now(); // 更新最后数据时间
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;

          const data = trimmed.slice(6);
          if (data === "[DONE]") continue;

          try {
            const chunk = JSON.parse(data);
            const lingzhuData = openaiChunkToLingzhu(
              chunk,
              body.message_id,
              body.agent_id
            );

            // 记录工具调用
            if (lingzhuData.type === "tool_call") {
              hasToolCall = true;
            }

            // 累积文本响应
            if (lingzhuData.answer_stream) {
              fullResponse += lingzhuData.answer_stream;
            }

            res.write(formatLingzhuSSE("message", lingzhuData));
          } catch {
            // 忽略解析错误
          }
        }
      }

      // 清理心跳定时器
      clearInterval(heartbeatTimer);

      // 如果没有工具调用，尝试从完整响应中提取 follow_up 建议
      if (!hasToolCall && fullResponse) {
        const suggestions = extractFollowUpFromText(fullResponse);
        if (suggestions && suggestions.length > 0) {
          const followUpData = createFollowUpResponse(
            suggestions,
            body.message_id,
            body.agent_id
          );
          res.write(formatLingzhuSSE("message", followUpData));
        }
      }

      // 发送结束事件
      res.write(formatLingzhuSSE("done", "[DONE]"));
      res.end();

      logger.info(`[Lingzhu] Completed: message_id=${body.message_id}`);
    } catch (error) {
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`[Lingzhu] Error: ${errorMsg}`);

      // 发送错误响应
      const errorData = {
        role: "agent" as const,
        type: "answer" as const,
        answer_stream: `[错误] ${errorMsg}`,
        message_id: (req as any).body?.message_id || "unknown", // Fallback if body parsing failed
        agent_id: (req as any).body?.agent_id || "unknown",
        is_finish: true,
      };
      res.write(formatLingzhuSSE("message", errorData));
      res.write(formatLingzhuSSE("done", "[DONE]"));
      res.end();
    }

    return true;
  };
}
