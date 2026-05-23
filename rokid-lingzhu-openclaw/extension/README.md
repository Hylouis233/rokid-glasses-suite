# Lingzhu Bridge - Rokid 灵珠平台 ↔ OpenClaw 接入插件

将 Rokid 智能眼镜通过灵珠平台接入 OpenClaw Agent，实现完整的 AI 助手体验。

## 特性

- 🔗 灵珠 SSE 协议 ↔ OpenClaw Chat Completions API 双向转换
- 🧠 完整 agent session 支持（人格/记忆/工具链/上下文）
- 🔐 自动生成鉴权 AK，安全接入
- 📡 流式 SSE 响应，实时返回到眼镜端
- 🎯 支持多 agent 精确路由

## 快速开始

```bash
# 1. 安装插件
openclaw plugins install ./extension

# 2. 配置（在 openclaw.json 中启用 chatCompletions + 指定 agentId）

# 3. 重启
openclaw gateway restart

# 4. 查看连接信息
openclaw lingzhu info
```

## 数据流

```
语音 → Rokid 眼镜 → Rokid AI App → 灵珠平台
  → SSE 请求到你的服务器:18789
    → Lingzhu 插件 → OpenClaw Agent Session
      → Agent 处理（SOUL.md + MEMORY.md + 工具链）
    → SSE 流式响应
  → 灵珠平台 → 眼镜显示 + 语音播报
```

## 配置项

| 配置 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | boolean | true | 启用/禁用插件 |
| `authAk` | string | 自动生成 | 鉴权密钥，留空自动生成 |
| `agentId` | string | "luna" | 目标 OpenClaw Agent ID |

## 前置要求

- OpenClaw 2026.3.x+
- `gateway.http.endpoints.chatCompletions.enabled: true`
- 公网 IP 或域名（灵珠平台需要能访问到你的服务器）
- Rokid 灵珠开发者账号

## 致谢

基于 [EndlessJour9527/r-wmi](https://clawhub.ai/EndlessJour9527/r-wmi) 修改。
原始协议转换逻辑由 [@wmi9527](mailto:yinjh9527@gmail.com) 开发。

## 修复内容（相对原版）

- `registerHttpHandler` → `registerHttpRoute` API 兼容（OpenClaw 2026.3.x）
- 固定 session key，支持多轮对话上下文记忆
- 通过 `x-openclaw-agent-id` + `x-openclaw-session-key` 精确路由到指定 agent
- 配置化 `agentId`，支持多 agent 环境

## License

MIT
