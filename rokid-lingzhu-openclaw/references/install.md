---
name: lingzhu
description: 灵珠平台接入 - 将 OpenClaw Agent 接入灵珠智能体平台
metadata: {"openclaw":{"emoji":"🔗","requires":{"plugins":["lingzhu"],"config":["gateway.http.endpoints.chatCompletions.enabled"]}}}
---

# 灵珠平台接入

通过 lingzhu 插件将 OpenClaw Agent 接入 Rokid 灵珠智能体平台，支持完整 agent session。

## 安装步骤

### 1. 安装 lingzhu 插件

```bash
openclaw plugins install ./extension
```

### 2. 启用 Chat Completions API 并配置 agent

在 `openclaw.json` 中添加：

```json5
{
  "gateway": {
    "http": {
      "endpoints": {
        "chatCompletions": {
          "enabled": true
        }
      }
    }
  },
  "plugins": {
    "entries": {
      "lingzhu": {
        "enabled": true,
        "config": {
          "agentId": "luna"  // 改成你的 agent id
        }
      }
    }
  }
}
```

**重要：** 如果你有多个 agent，确保目标 agent 在 `agents.list` 中排第一位，或设置 `"default": true`。

### 3. 重启 Gateway

```bash
openclaw gateway restart
```

## 查看状态

```bash
openclaw lingzhu info
openclaw lingzhu status
```

## 提交给灵珠平台

1. **智能体SSE接口地址**: `http://<公网IP>:18789/metis/agent/api/sse`
2. **智能体鉴权AK**: 运行 `openclaw lingzhu info` 获取
