# 検証済み手順 (v0.2.0)

このドキュメントは、notify-mcp の動作確認に使った実際の手順を記録しています。

## ローカル(Bun)

```bash
bun install
CONFIG_PATH=/tmp/notify-mcp-test-config.yaml bun run server
bun run desktop

# APIチェック
curl http://localhost:19800/health
curl http://localhost:19800/api/channels
curl -X POST http://localhost:19800/api/test \
  -H 'Content-Type: application/json' \
  -d '{"message":"Smoke test","urgency":"info"}'

curl http://localhost:19800/api/logs
```

## Docker Compose

```bash
# この環境では docker-compose (v1) を使用
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
