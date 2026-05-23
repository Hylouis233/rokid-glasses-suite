# Rokid 灵珠平台实机联调清单

这份清单用于真实 Rokid Glasses / Rokid AI App / 灵珠平台联调。设备联调开始前，先确认服务端本地 curl 已通过，再接入公网 HTTPS 反向代理。

## 联调前准备

- Rokid 眼镜已绑定 Rokid AI App（国内版）。
- 已登录灵珠开发者平台，并能创建自定义三方智能体。
- 服务端具备公网域名或公网 IP，推荐使用 HTTPS。
- 反向代理已关闭 SSE buffering。
- 已准备 Auth AK，并分别写入服务端环境变量或 OpenClaw 插件配置。
- Home Assistant / MQTT / OpenClaw 本地目标服务已可用。

## 服务端预检

### Home Assistant Control Kit

```bash
curl http://127.0.0.1:8080/health
curl -N -X POST http://127.0.0.1:8080/rokid/sse \
  -H 'Authorization: Bearer replace-with-rokid-auth-ak' \
  -H 'Content-Type: application/json' \
  -d '{"text":"打开客厅灯","sessionId":"debug"}'
```

需要确认：

- `/health` 返回正常。
- `/rokid/sse` 有 SSE 输出。
- 错误 AK 会被拒绝。
- allowlist 和高风险操作二次确认按预期生效。

### Hermes Connector

```bash
curl http://127.0.0.1:8081/health
curl -N -X POST http://127.0.0.1:8081/rokid/sse \
  -H 'Authorization: Bearer replace-with-rokid-auth-ak' \
  -H 'Content-Type: application/json' \
  -d '{"text":"打开客厅灯","sessionId":"debug"}'
```

需要确认：

- `ha-direct` 能返回 Home Assistant Conversation 结果。
- `hermes-log` 能生成 intent payload。
- `hermes-mqtt` 能向 broker 发布消息。
- MQTT topic 与订阅端一致。

### OpenClaw 插件

```bash
openclaw plugins install ./extension
openclaw gateway restart
openclaw lingzhu info
```

需要确认：

- `openclaw lingzhu info` 能显示 SSE 地址和 AK。
- Chat Completions endpoint 已启用。
- 指定 `agentId` 能正确路由到目标 agent。
- 多轮对话 session key 能保留上下文。

## 灵珠平台配置

在灵珠开发者平台创建自定义三方智能体：

- 输入类型：文字。
- SSE URL：填写公网 HTTPS 地址，例如 `https://你的域名/rokid/sse` 或 OpenClaw 插件提供的 `/metis/agent/api/sse`。
- Auth AK：填写服务端对应 AK。
- 先不要提审，保持私有调试。

## 重点验证项

| 验证项 | 期望结果 | 记录 |
| --- | --- | --- |
| 请求字段 | 服务端能正确读取 `text`、`content`、`query`、`input` 中至少一种 | |
| sessionId | 多轮请求能保持同一会话或可追踪 session | |
| SSE message event | 眼镜端能显示并播报内容 | |
| SSE done event | 灵珠平台能正常结束本轮请求 | |
| SSE error event | 错误能转成可理解提示 | |
| 30 秒内响应 | 简单指令不超时 | |
| 60 秒边界 | 较慢任务有明确表现记录 | |
| 反向代理 streaming | 不是一次性缓冲输出 | |
| 鉴权失败 | 错误 AK 被拒绝且不泄露内部信息 | |
| HA 控制闭环 | 低风险设备能被成功控制 | |
| 高风险设备 | 未确认时拒绝，确认后才允许 | |
| OpenClaw 多轮 | agent 记忆和上下文符合预期 | |
| Hermes MQTT | broker 能收到 intent payload | |

## 记录模板

```text
日期：
设备型号：
Rokid AI App 版本：
灵珠平台智能体 ID：
服务端公网地址：
测试项目：HA Control Kit / Hermes Connector / OpenClaw Bridge

请求原文：
服务端收到的 JSON：
SSE 原始输出：
眼镜端显示：
眼镜端语音播报：
耗时：
是否超时：
是否符合预期：
问题与截图：
下一步处理：
```

## 通过标准

- 三个连接件至少各完成一条端到端成功路径。
- 失败 AK、缺失字段、下游服务不可用都有可理解错误。
- 简单控制指令在灵珠平台超时前返回。
- 反向代理不会破坏 SSE streaming。
- README 中的部署步骤与真实联调步骤一致。
