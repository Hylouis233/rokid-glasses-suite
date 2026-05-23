# Rokid Lingzhu Bridge for OpenClaw

将 Rokid 智能眼镜通过灵珠平台接入 OpenClaw Agent，让你可以直接用眼镜和本地智能体对话，并保留人格、记忆与工具能力。

## 项目定位

这个插件负责把灵珠平台的 SSE 请求转换为 OpenClaw 可处理的 Chat Completions / Agent Session 请求，再把结果以 SSE 流式返回给灵珠平台。

适合以下场景：

- 想把 Rokid 眼镜接入本地 OpenClaw Agent
- 想做多 agent 路由和上下文记忆
- 想保留灵珠平台入口，但接入自己的智能体能力

## 核心特性

- 灵珠 SSE 协议 ↔ OpenClaw Chat Completions API 双向转换
- 完整 agent session 支持：SOUL.md、MEMORY.md、工具链、上下文记忆
- 自动生成鉴权 AK，默认安全接入
- 流式 SSE 响应，实时返回到眼镜端
- 支持多 agent 精确路由，可配置 `agentId`
- 提供中英文说明，方便部署和二次开发

## 数据流

```text
语音 → Rokid 眼镜 → Rokid AI App → 灵珠平台
  → SSE 请求到你的服务器:18789
    → Lingzhu 插件 → OpenClaw Agent Session
      → Agent 处理（SOUL.md / MEMORY.md / 工具链）
    → SSE 流式响应
  → 灵珠平台 → 眼镜显示 + 语音播报
```

## 快速开始

```bash
openclaw plugins install ./extension
openclaw gateway restart
openclaw lingzhu info
```

## 配置方式

在 `openclaw.json` 中启用灵珠插件和 Chat Completions：

```json5
{
  gateway: {
    http: {
      endpoints: {
        chatCompletions: { enabled: true }
      }
    }
  },
  plugins: {
    entries: {
      lingzhu: {
        enabled: true,
        config: {
          agentId: "your-agent-id"
        }
      }
    }
  }
}
```

## 配置项

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `enabled` | boolean | true | 启用或禁用插件 |
| `authAk` | string | 自动生成 | 灵珠平台调用时携带的鉴权 AK，留空自动生成 |
| `agentId` | string | `luna` | 目标 OpenClaw Agent ID |

> 如果你有多个 agent，建议把目标 agent 放在 `agents.list` 中优先位置，或设置为 `default: true`。

## 灵珠平台配置

1. 登录 [灵珠开发者平台](https://agent-develop.rokid.com/)
2. 创建智能体 → 三方智能体 → 自定义智能体
3. 填写以下信息：
   - SSE 接口地址：`http://<你的公网IP>:18789/metis/agent/api/sse`
   - 鉴权 AK：运行 `openclaw lingzhu info` 获取
   - 入参类型：文字
4. 不要提审，保持私有使用
5. 在 Rokid AI App 中进入开发者调试页，选择你的智能体并测试

## 前置要求

- OpenClaw 2026.3.x+
- 公网 IP 或域名
- Rokid 灵珠开发者账号
- Rokid 眼镜 + Rokid AI App（国内版）

## 已修复内容

- `registerHttpHandler` → `registerHttpRoute` API 兼容
- 固定 session key，支持多轮对话上下文记忆
- 通过 `x-openclaw-agent-id` + `x-openclaw-session-key` 精确路由到指定 agent
- 配置化 `agentId`，支持多 agent 环境

## 已知限制

- 灵珠平台 SSE 超时通常在 30~60 秒，复杂任务可能仍然超时
- 部分灵珠平台版本可能不识别 SSE comment heartbeat

## 参考与致谢

基于 [EndlessJour9527/r-wmi](https://clawhub.ai/EndlessJour9527/r-wmi) 修改。原始协议转换逻辑由 [@wmi9527](mailto:yinjh9527@gmail.com) 开发。

## 许可证

MIT
