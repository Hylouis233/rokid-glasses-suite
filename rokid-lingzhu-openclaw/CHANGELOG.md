# Changelog

## [1.1.1] - 2026-03-08

### Fixed
- **SSE heartbeat keepalive**: Send SSE comment heartbeat every 12s during long-running agent tasks (tool calls, web search, etc.) to prevent Lingzhu platform timeout disconnection.
- **User message fallback**: When `lingzhuToOpenAI` produces no user-role message (e.g., unexpected Lingzhu request format), extract raw text or default to `"你好"` to avoid OpenClaw 400 error.

### Known Limitations
- Lingzhu platform SSE timeout is ~30-60s. Even with heartbeat, very long tasks (>60s) may still timeout on the glasses side. Complex tasks (research reports, multi-tool workflows) are better suited for Telegram.
- SSE comment heartbeats (`: heartbeat\n\n`) may not be recognized by all Lingzhu platform versions. If timeout persists, consider switching to actual SSE data events with "processing" status.

## [1.1.0] - 2026-03-08

### Fixed
- **OpenClaw 2026.3.x API compatibility**: Migrated from `registerHttpHandler` to `registerHttpRoute({ path, handler, auth, match })`.
- **Session persistence**: Changed session key from per-request `lingzhu:${message_id}` to fixed `lingzhu:${agentId}:default` for multi-turn context continuity.
- **Multi-agent routing**: Added `x-openclaw-agent-id` and `x-openclaw-session-key` headers to internal `/v1/chat/completions` call. Configurable via `plugins.entries.lingzhu.config.agentId`.

### Added
- Bilingual README (English + Chinese)
- Installation guide (`references/install.md`)
- Plugin config: `agentId` field to specify target agent

## [1.0.0] - 2026-03-07 (original by @wmi9527)

### Initial Release
- Lingzhu SSE bridge for OpenClaw
- Message format conversion (Lingzhu ↔ OpenAI)
- AK-based authentication
- Follow-up suggestion extraction
