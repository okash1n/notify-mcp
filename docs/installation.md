# Installation (v0.2)

Japanese version: `docs/installation_jp.md`

notify-mcp can run as a **single Docker image** or **locally with Bun**. We do not provide a remote MCP service; this is for local/self-hosted use.

## Option 1: Docker (recommended for distribution/ops)

```bash
# Start
# Use docker-compose if docker compose is not available.
docker compose up -d

# Web UI
# http://localhost:19800
```

### Config
- Edit `config/config.yaml`
- Restart the container after changes

### docker run example
```bash
docker run -p 19800:19800 \
  -v $(pwd)/config:/app/config \
  -v $(pwd)/data:/app/data \
  notify-mcp
```

## Option 1.5: GHCR (prebuilt image)

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

If you see `unauthorized` when pulling/pushing, log in first:
```bash
docker login ghcr.io
```

## Option 2: Local (Bun) (recommended for dev/testing)

```bash
bun install
bun run server
```

- Default URL: `http://localhost:19800`
- Set `CONFIG_PATH` to change config path

## Desktop Notifications

If you use the `desktop` channel, run the desktop client on the OS that should display notifications:

```bash
bun run desktop
```

### Docker + Desktop
- Containers cannot access the host OS notification APIs
- Set `desktop.endpoint` to a **host-reachable address**

Examples:
- Docker Desktop (macOS/Windows): `ws://host.docker.internal:9876`
- WSL2 Docker Engine: `ws://<Windows-host-IP>:9876`

## MCP Host Registration

Register the HTTP MCP endpoint in your host app:

`http://<host>:19800/mcp`

## References
- Compatibility matrix: `docs/compatibility.md`
- Config example: `config/config.yaml`
