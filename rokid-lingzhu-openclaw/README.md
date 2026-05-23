# Rokid Lingzhu Bridge for OpenClaw

[中文](#中文) | [English](#english)

---

<a name="english"></a>

## English

### What is this?

A plugin that connects [Rokid smart glasses](https://www.rokid.com/) to [OpenClaw](https://github.com/openclaw/openclaw) via the [Lingzhu platform](https://agent-develop.rokid.com/). Talk to your AI agent through your glasses — with full personality, memory, and tool access.

### Features

- 🔗 Lingzhu SSE protocol ↔ OpenClaw Chat Completions API bridge
- 🧠 Full agent session support (SOUL.md / MEMORY.md / tools / context memory)
- 🔐 Auto-generated auth key (AK), secure by default
- 📡 Streaming SSE responses, real-time feedback to glasses
- 🎯 Multi-agent routing support (configurable `agentId`)

### Data Flow

```
Voice → Rokid Glasses → Rokid AI App → Lingzhu Platform
  → SSE request to your server:18789
    → Lingzhu Plugin → OpenClaw Agent Session
      → Agent processes (SOUL.md + MEMORY.md + tools)
    → SSE streaming response
  → Lingzhu Platform → Glasses display + voice playback
```

### Quick Start

```bash
# 1. Install the plugin
openclaw plugins install ./extension

# 2. Restart
openclaw gateway restart

# 3. Get your SSE endpoint and auth key
openclaw lingzhu info
```

### Configuration

Add to your `openclaw.json`:

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
          agentId: "your-agent-id"  // which agent to route to
        }
      }
    }
  }
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | true | Enable/disable the plugin |
| `authAk` | string | auto-generated | Auth key for Lingzhu platform. Leave empty to auto-generate |
| `agentId` | string | "luna" | Target OpenClaw agent ID |

> **Multi-agent note:** If you have multiple agents, make sure your target agent is either first in `agents.list` or has `"default": true`.

### Lingzhu Platform Setup

1. Go to [Lingzhu Developer Platform](https://agent-develop.rokid.com/)
2. Create Agent → Third-party Agent → Custom Agent
3. Fill in:
   - SSE URL: `http://<your-public-ip>:18789/metis/agent/api/sse`
   - Auth AK: run `openclaw lingzhu info` to get it
   - Input type: Text
4. Don't submit for review (keeps it private to your account)
5. Rokid AI App → Settings → Developer → Agent Debug → Select your agent → Test

### Requirements

- OpenClaw 2026.3.x+
- Public IP or domain (Lingzhu platform needs to reach your server)
- Rokid Lingzhu developer account
- Rokid glasses + Rokid AI App (China version)

---

<a name="中文"></a>

## 中文

### 这是什么？

一个将 [Rokid 智能眼镜](https://www.rokid.com/) 通过[灵珠平台](https://agent-develop.rokid.com/)接入 [OpenClaw](https://github.com/openclaw/openclaw) 的插件。戴上眼镜直接跟你的 AI 助手对���——完整的人格、记忆和工具能力。

### 特性

- 🔗 灵珠 SSE 协议 ↔ OpenClaw Chat Completions API 双向转换
- 🧠 完整 agent session 支持（SOUL.md / MEMORY.md / 工具链 / 上下文记忆）
- 🔐 自动生成鉴权 AK，开箱即用
- 📡 流式 SSE 响应，实时返回到眼镜端
- 🎯 多 agent 精确路由（可配置 `agentId`）

### 数据流

```
语音 → Rokid 眼镜 → Rokid AI App → 灵珠平台
  → SSE 请求到你的服务器:18789
    → Lingzhu 插件 → OpenClaw Agent Session
      → Agent 处理（SOUL.md + MEMORY.md + 工具链）
    → SSE 流式响应
  → 灵珠平台 → 眼镜显示 + 语音播报
```

### 快速开始

```bash
# 1. 安装插件
openclaw plugins install ./extension

# 2. 重启
openclaw gateway restart

# 3. 查看 SSE 地址和鉴权 AK
openclaw lingzhu info
```

### 配置

在 `openclaw.json` 中添加：

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
          agentId: "your-agent-id"  // 指定路由到哪个 agent
        }
      }
    }
  }
}
```

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `enabled` | boolean | true | 启用/禁用插件 |
| `authAk` | string | 自动生成 | 鉴权密钥，留空自动生成 |
| `agentId` | string | "luna" | 目标 OpenClaw Agent ID |

> **多 agent 注意：** 如果你有多个 agent，确保目标 agent 在 `agents.list` 中排第一位，或设置 `"default": true`。

### 灵珠平台配置

1. 登录[灵珠开发者平台](https://agent-develop.rokid.com/)
2. 创建智能体 → 三方智能体 → 自定义智能体
3. 填写：
   - SSE 接口地址：`http://<你的公网IP>:18789/metis/agent/api/sse`
   - 鉴权 AK：运行 `openclaw lingzhu info` 获取
   - 入参类型：文字
4. 不要提审（未提审 = 仅自己可用）
5. Rokid AI App → 设置 → 开发者 → 智能体调试 → 选择你的智能体 → 测试

### 前置要求

- OpenClaw 2026.3.x+
- 公网 IP 或域名（灵珠平台需要能访问到你的服务器）
- Rokid 灵珠开发者账号
- Rokid 眼镜 + Rokid AI App（国内版）

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for full history.

### v1.1.1 (2026-03-08)

- SSE heartbeat keepalive (12s interval) to prevent Lingzhu platform timeout
- User message fallback to avoid 400 errors on unexpected request formats

### v1.1.0 (2026-03-08)

- `registerHttpHandler` → `registerHttpRoute` API compatibility (OpenClaw 2026.3.x)
- Session persistence: fixed session key for multi-turn conversation context
- Agent routing: `x-openclaw-agent-id` + `x-openclaw-session-key` headers for precise routing
- Configurable `agentId` via plugin config

### Known Limitations

- Lingzhu platform SSE timeout is ~30-60s. Complex tasks (research reports, multi-tool workflows) may still timeout on the glasses side — use Telegram for those.
- SSE comment heartbeats may not be recognized by all Lingzhu platform versions.

## Credits

Based on [EndlessJour9527/r-wmi](https://clawhub.ai/EndlessJour9527/r-wmi). Original protocol conversion by [@wmi9527](mailto:yinjh9527@gmail.com).

## License

MIT
