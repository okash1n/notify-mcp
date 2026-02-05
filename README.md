# notify-mcp

A generic MCP notification server for LLM agents. One `notify` tool triggers user-facing notifications for task completion, input requests, and errors.

- MCP: Streamable HTTP (`/mcp`)
- Web UI: `/` + `/api/*`
- Channels: `http-webhook`, `ntfy`, `desktop`
- Logs: SQLite

## Quickstart (Docker)

```bash
# 1) Start
# Use docker-compose if docker compose is not available.
docker compose up -d

# 2) Web UI
# http://localhost:19800
```

Edit `config/config.yaml` to add or adjust channels.
Web UI can also create and edit channels and core settings.

## GHCR Image

Tags:
- `ghcr.io/okash1n/notify-mcp:latest`
- `ghcr.io/okash1n/notify-mcp:v0.2.0`

```bash
docker pull ghcr.io/okash1n/notify-mcp:latest

docker run -p 19800:19800 \
  -v $(pwd)/config:/app/config \
  -v $(pwd)/data:/app/data \
  ghcr.io/okash1n/notify-mcp:latest
```

## Local Run (No Docker)

```bash
bun install
bun run server
```

- Default URL: `http://localhost:19800`
- Set `CONFIG_PATH` to override the config location

## Desktop Notifications

If you use the `desktop` channel, run the desktop client on the host OS that should show notifications:

```bash
bun run desktop
```

- When Web UI / MCP runs in Docker, the desktop client still must run on the host OS
- For WSL2 + Docker Engine, set the `desktop` endpoint to the Windows host IP

## MCP Host Setup

Register an HTTP MCP endpoint in your host app:

`http://<host>:19800/mcp`

## Verified Runbook

See `docs/verified.md` for the exact commands used to validate v0.2.0.

**Docs (EN)**
- `docs/installation.md`
- `docs/compatibility.md`
- `docs/verified.md`

**Docs (JP)**
- `README_jp.md`
- `docs/installation_jp.md`
- `docs/compatibility_jp.md`
- `docs/verified_jp.md`
