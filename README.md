# Rokid Glasses 智能生态开发套件

面向 Rokid Glasses / 灵珠平台开发者的开源套件，用于把眼镜端大模型入口接入 Home Assistant、OpenClaw 与 Hermes/Rhasspy 生态。

这个仓库不是单一应用，而是一组边界清晰的连接件：你可以只使用 Home Assistant 控制套件，也可以把 Rokid 眼镜作为 OpenClaw Agent 或 Hermes intent 的入口。

## 项目亮点

- **开箱可跑通 Rokid → Home Assistant 控制闭环**：支持自然语言、实体别名、HA service 调用与 HA Conversation。
- **支持灵珠平台 SSE 接入**：提供 `/rokid/sse`，兼容 `text`、`content`、`query`、`input`、`sessionId` 等常见请求字段。
- **面向真实部署的安全基线**：支持 Auth AK、实体 allowlist、service allowlist、高风险操作二次确认与审计日志。
- **可选 Home Assistant Add-on**：降低 HA 用户使用门槛，不必手写 Docker 环境变量。
- **兼容 OpenClaw 与 Hermes 生态**：适合本地智能体、Rhasspy、MQTT、HA Conversation 等多种玩法。
- **CI / Release 就绪**：包含 Go 格式检查、测试、构建、Docker build 与 release artifact 工作流。

## 仓库组成

| 目录 | 定位 | 适合谁使用 |
| --- | --- | --- |
| [`rokid-ha-control-kit`](./rokid-ha-control-kit) | Rokid / HTTP 到 Home Assistant 的控制服务 | 想用 Rokid 眼镜控制 HA 设备的用户 |
| [`rokid-hermes-connector`](./rokid-hermes-connector) | Rokid 到 HA Conversation / Hermes MQTT 的桥接服务 | 已有 Rhasspy、Hermes、MQTT 或 HA Conversation 的用户 |
| [`rokid-lingzhu-openclaw`](./rokid-lingzhu-openclaw) | Rokid 灵珠到 OpenClaw Agent 的插件 | 想把眼镜接入本地 Agent 的 OpenClaw 用户 |
| [`home-assistant-addon`](./home-assistant-addon) | HA Add-on 打包目录 | 想在 HA Add-on Store 中安装运行的用户 |

## 架构概览

```text
Rokid Glasses / Rokid AI App
          │
          ▼
Rokid 灵珠平台自定义智能体
          │  HTTPS + SSE + Auth AK
          ▼
┌──────────────────────────────┐
│ Rokid Glasses Suite           │
├──────────────────────────────┤
│ rokid-ha-control-kit          │──► Home Assistant REST / Conversation
│ rokid-hermes-connector        │──► Hermes MQTT / HA Conversation
│ rokid-lingzhu-openclaw        │──► OpenClaw Chat Completions / Agent
└──────────────────────────────┘
```

## 快速开始：Home Assistant 控制

进入控制套件目录：

```bash
cd rokid-ha-control-kit
cp .env.example .env
```

编辑 `.env`：

```env
HA_URL=http://homeassistant.local:8123
HA_TOKEN=replace-with-home-assistant-token
ROKID_AUTH_AK=replace-with-rokid-auth-ak
ENTITY_ALIASES_FILE=config/entity_aliases.example.json
ALLOWED_ENTITIES=light.living_room,switch.air_purifier
ALLOWED_SERVICES=light.turn_on,light.turn_off,switch.turn_on,switch.turn_off
CONFIRM_TOKEN=replace-with-confirm-token
AUDIT_LOG_FILE=logs/audit.log
```

本地运行：

```bash
go run .
```

健康检查：

```bash
curl http://127.0.0.1:8080/health
```

测试 SSE：

```bash
curl -N -X POST http://127.0.0.1:8080/rokid/sse \
  -H 'Authorization: Bearer replace-with-rokid-auth-ak' \
  -H 'Content-Type: application/json' \
  -d '{"text":"打开客厅灯","sessionId":"debug"}'
```

## Home Assistant Add-on

Add-on 位于 [`home-assistant-addon/rokid-ha-control-kit`](./home-assistant-addon/rokid-ha-control-kit)。它包含：

- `config.yaml`：Add-on manifest、options 与 schema。
- `Dockerfile`：基于 Home Assistant base image 构建服务。
- `rootfs/etc/services.d/rokid-ha-control-kit/run`：启动脚本，将 Add-on options 映射为环境变量。
- `README.md`：安装与配置说明。

推荐把 `home-assistant-addon` 作为 Add-on repository 使用，用户只需要在 Home Assistant UI 中填写 HA Token、Rokid Auth AK 和 allowlist。

## 安全设计

公开部署时请至少遵守以下原则：

- 生产环境必须设置 `ROKID_AUTH_AK`。
- 不要在 URL query 中传递 AK；使用 `Authorization: Bearer <ak>` 或 `X-Auth-AK`。
- 不要将 Home Assistant、OpenClaw Gateway 或 MQTT broker 完整暴露到公网。
- 只通过 HTTPS 反向代理暴露必要路径，例如 `/rokid/sse`。
- 使用 `ALLOWED_ENTITIES` 和 `ALLOWED_SERVICES` 限制可控设备和 service。
- `lock`、`camera`、`alarm_control_panel`、`person` 等高风险 domain 默认需要二次确认。
- 开启 `AUDIT_LOG_FILE` 后，service 调用会写入 JSON Lines 审计日志。

## 发布前检查

两个 Go 项目均应通过：

```bash
go fmt ./...
go test ./...
go build ./...
```

本仓库已包含 GitHub Actions：

- `.github/workflows/ci.yml`：格式检查、测试、构建、Docker build。
- `.github/workflows/release.yml`：推送 `v*` tag 时生成 Linux、macOS、Windows 的 amd64/arm64 可执行文件。

## 当前状态

这是 Alpha 版本，适合开发者预览、二次开发和小范围试用。真实 Rokid 灵珠平台设备联调仍建议在正式公开推广前完成，重点验证：

1. 灵珠平台实际请求字段。
2. SSE event 兼容性。
3. 超时和错误处理。
4. 反向代理对 SSE streaming 的影响。
5. 高风险操作确认流程的用户体验。

## 路线图

- [x] Rokid → Home Assistant 控制闭环
- [x] Rokid → Hermes MQTT intent bridge
- [x] Rokid → OpenClaw Agent bridge
- [x] Auth AK、allowlist、二次确认、审计日志
- [x] Home Assistant Add-on 初版
- [x] CI / Release 工作流
- [ ] 真实 Rokid 灵珠平台端到端联调
- [ ] 更完整的 Add-on 仓库发布说明
- [ ] 更多 HA domain 的自然语言规则
- [ ] 可视化配置向导

## 贡献

欢迎提交 issue、PR、设备适配记录和联调结果。提交前请确认：

1. 没有提交 `.env`、真实 token、AK、密码、审计日志或本地构建产物。
2. Go 项目通过 `go fmt ./...`、`go test ./...`、`go build ./...`。
3. 涉及公网部署、鉴权或设备控制的改动需要说明安全影响。

## 许可证

MIT。详见 [LICENSE](./LICENSE)。
