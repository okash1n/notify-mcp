# Compatibility Matrix (v0.2)

Japanese version: `docs/compatibility_jp.md`

## Goal
Clarify supported environments and channel availability.

## Assumptions
- MCP server is Streamable HTTP
- MCP endpoint is `/mcp`
- Web UI is `/` + `/api/*`
- Desktop notifications require the desktop client on the host OS
- Containers cannot call host OS notification APIs directly
- Remote MCP hosting is not provided (local/self-hosted only)

## Deployment Options
| Mode | Use case | Start | Notes |
|---|---|---|---|
| Docker single image | Distribution/ops | `docker run` / `docker compose` | Web UI + MCP in one container |
| Local (Bun) | Dev/testing | `bun install` → `bun run server` | Fast iteration; easy desktop testing |

## Channel x Environment (Scorecard)
Legend: `OK` = works as-is / `COND` = extra setup required / `NO` = not supported

| Environment | http-webhook | ntfy | desktop | Notes |
|---|---|---|---|---|
| Local (macOS/Linux/Windows) | OK | OK | OK | Run `desktop-client` on the same host |
| Docker on Linux host | OK | OK | COND | Use `ws://host.docker.internal:9876` or `--network host` |
| Docker Desktop on macOS | OK | OK | OK | Use `ws://host.docker.internal:9876` |
| Docker Desktop on Windows | OK | OK | OK | Use `ws://host.docker.internal:9876` |
| Docker Engine in WSL2 (Windows host) | OK | OK | COND | Run desktop client on Windows and use Windows host IP |
| VPS / remote Linux | OK | OK | NO | Desktop not available; use push/webhook |

## MCP + Web UI Matrix
| Environment | MCP + Web UI | Recommended URL | Notes |
|---|---|---|---|
| Local (macOS/Linux/Windows) | OK | `http://localhost:19800` | Bun or Docker |
| Docker on Linux host | OK | `http://localhost:19800` | Port publish required |
| Docker Desktop on macOS | OK | `http://localhost:19800` |  |
| Docker Desktop on Windows | OK | `http://localhost:19800` |  |
| Docker Engine in WSL2 (Windows host) | OK | `http://localhost:19800` | Running inside WSL2 |
| VPS / remote Linux | OK | `http://<server>:19800` | Remote MCP is out of scope |

## WSL2 (Docker Engine) Notes
- Containers run inside the WSL2 VM; `localhost` points to WSL2
- To reach Windows desktop-client, use the Windows host IP
- Quick lookup: `cat /etc/resolv.conf` and use the `nameserver` value
- Windows firewall may need to allow port `9876`

## Desktop Client Location
- macOS: macOS host
- Windows: Windows host
- Linux: Linux host

## Recommended Usage
- Development: Local Bun + desktop client on same host
- Ops: Docker single image + desktop client on host OS

## Key Env Vars
- `HOST`: bind address (default `0.0.0.0`)
- `PORT`: server port (default `19800`)
- `CONFIG_PATH`: config file path
