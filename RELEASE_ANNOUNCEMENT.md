# Rokid Glasses Suite 发布公告

Rokid Glasses Suite 是一组面向 Rokid Glasses / 灵珠平台开发者的开源连接件，用来把眼镜端的大模型入口接入 Home Assistant、OpenClaw 与 Hermes/Rhasspy 生态。

它的目标很直接：让 Rokid 眼镜不只是一个显示和语音交互设备，而是可以成为本地智能家居、本地智能体和语音自动化系统的自然语言入口。

## 这次发布包含什么

本次首个公开预览版包含三个独立仓库：

1. **Rokid Home Assistant Control Kit**
   - 把 Rokid 灵珠平台的 SSE 请求接入 Home Assistant。
   - 支持自然语言控制、实体别名、HA service 直调和 HA Conversation。
   - 内置 Auth AK、实体 allowlist、service allowlist、高风险操作二次确认和审计日志。

2. **Rokid Hermes Connector**
   - 把 Rokid 眼镜侧输入转换为 Home Assistant Conversation 请求或 Hermes/Rhasspy MQTT intent。
   - 支持 `ha-direct`、`hermes-log`、`hermes-mqtt` 三种模式。
   - 适合已经在使用 Rhasspy、Hermes、MQTT 或 HA Conversation 的用户。

3. **Rokid Lingzhu Bridge for OpenClaw**
   - 把 Rokid 灵珠平台接入 OpenClaw Agent。
   - 支持 Agent Session、固定 session key、多轮上下文、SOUL.md、MEMORY.md 和工具链。
   - 适合把 Rokid 眼镜作为本地智能体入口使用。

## 适合谁

- 想用 Rokid 眼镜控制 Home Assistant 设备的用户。
- 想把 Rokid 眼镜接入 OpenClaw 本地智能体的人。
- 已经在使用 Hermes、Rhasspy、MQTT 或 HA Conversation 的开发者。
- 想研究 Rokid 灵珠平台 SSE 自定义智能体接入方式的开发者。

## 当前状态

这是 `v0.1.0` 公开预览版，已经完成基础代码、README、许可证、GitHub 仓库展示、Release 和安全基线整理。

下一步重点是真实 Rokid 灵珠平台端到端联调，验证实际请求字段、SSE event 兼容性、平台超时、反向代理 streaming 和眼镜端语音播报效果。

## 项目入口

- Rokid Home Assistant Control Kit: https://github.com/Hylouis233/rokid-ha-control-kit
- Rokid Hermes Connector: https://github.com/Hylouis233/rokid-hermes-connector
- Rokid Lingzhu Bridge for OpenClaw: https://github.com/Hylouis233/rokid-lingzhu-openclaw
- 套件总览: https://github.com/Hylouis233/rokid-glasses-suite
