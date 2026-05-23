# Rokid Home Assistant Control Kit Add-on

这个 Home Assistant Add-on 会在 HA 内运行 `rokid-ha-control-kit`，提供 `/rokid/sse`、`/intent`、`/service-call` 和 `/entities`。

## 安装

1. 将本目录作为 Home Assistant add-on repository 的一个 add-on 目录，或把整个 `home-assistant-addon` 目录放入你的 add-on 仓库。
2. 在 Home Assistant Add-on Store 里刷新仓库。
3. 打开 `Rokid Home Assistant Control Kit`，填写配置并启动。

## 配置项

- `ha_url`：Home Assistant 地址。
- `ha_token`：Home Assistant Long-Lived Access Token。
- `rokid_auth_ak`：灵珠平台 Auth AK，生产环境必须设置。
- `entity_aliases_file`：实体别名文件，默认位于 `/share/rokid-ha-control-kit/entity_aliases.json`。
- `allowed_entities`：逗号分隔的实体 allowlist，例如 `light.living_room,switch.air_purifier`。
- `allowed_services`：逗号分隔的 service allowlist，例如 `light.turn_on,light.turn_off`。
- `confirm_token`：高风险 domain 的二次确认 token。
- `audit_log_file`：审计日志路径。

## 灵珠平台

- SSE URL：`https://<你的公网域名>/rokid/sse`
- Auth AK：填写与 `rokid_auth_ak` 相同的值
- 请求头：使用 `Authorization: Bearer <ak>` 或 `X-Auth-AK: <ak>`
