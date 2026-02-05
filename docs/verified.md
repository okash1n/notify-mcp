# Verified Runbook (v0.2.0)

This section records the exact commands used to validate notify-mcp.

## Local (Bun)

```bash
bun install
CONFIG_PATH=/tmp/notify-mcp-test-config.yaml bun run server
bun run desktop

# API checks
curl http://localhost:19800/health
curl http://localhost:19800/api/channels
curl -X POST http://localhost:19800/api/test \
  -H 'Content-Type: application/json' \
  -d '{"message":"Smoke test","urgency":"info"}'

curl http://localhost:19800/api/logs
```

## Docker Compose

```bash
# docker-compose (v1) was used in this environment
docker-compose up -d
curl http://localhost:19800/health
```

## Docker Run

```bash
docker build -t notify-mcp:local .

docker run -d --name notify-mcp-local -p 19800:19800 \
  -v $(pwd)/config:/app/config \
  -v $(pwd)/data:/app/data \
  notify-mcp:local

curl http://localhost:19800/health
```

## GHCR

```bash
docker pull ghcr.io/okash1n/notify-mcp:latest

docker run -d --name notify-mcp-ghcr -p 19800:19800 \
  -v $(pwd)/config:/app/config \
  -v $(pwd)/data:/app/data \
  ghcr.io/okash1n/notify-mcp:latest

curl http://localhost:19800/health
```
