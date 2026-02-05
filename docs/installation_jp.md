# インストール方法 (v0.2)

English version: `docs/installation.md`

notify-mcp は **Docker 1イメージ** と **ローカル(Bun)** の両方で動かせます。リモートMCPの提供は行わず、ローカル/自己ホスト前提です。

## 方式1: Docker (配布/運用向け)

```bash
# 起動
# docker compose が使えない場合は docker-compose を利用してください。
docker compose up -d

# Web UI
# http://localhost:19800
```

### 設定
- `config/config.yaml` を編集
- Web UIからチャネル追加や設定変更も可能
- 変更後はコンテナ再起動

### docker run 例
```bash
docker run -p 19800:19800 \
  -v $(pwd)/config:/app/config \
  -v $(pwd)/data:/app/data \
  notify-mcp
```

## 方式1.5: GHCR (事前ビルド済み)

タグ:
- `ghcr.io/okash1n/notify-mcp:latest`
- `ghcr.io/okash1n/notify-mcp:v0.2.0`

```bash
docker pull ghcr.io/okash1n/notify-mcp:latest

docker run -p 19800:19800 \
  -v $(pwd)/config:/app/config \
  -v $(pwd)/data:/app/data \
  ghcr.io/okash1n/notify-mcp:latest
```

`unauthorized` が出る場合は先にログインします:
```bash
docker login ghcr.io
```

## 方式2: ローカル(Bun) (開発/検証向け)

```bash
bun install
bun run server
```

- デフォルト: `http://localhost:19800`
- `CONFIG_PATH` を指定すれば設定ファイルの場所を変更できます

## Desktop通知

`desktop` チャネルを使う場合は、**通知を出すOS上で desktop-client を起動**します。

```bash
bun run desktop
```

### Docker + Desktop通知
- コンテナ内からホストOSの通知APIにはアクセスできません
- `desktop` の `endpoint` は **ホスト側のIP/名前** を指定します

例:
- Docker Desktop (macOS/Windows): `ws://host.docker.internal:9876`
- WSL2 Docker Engine: `ws://<WindowsホストIP>:9876`

## MCPホストへの登録

MCPホストは **HTTPエンドポイント** を登録する形になります。

`http://<host>:19800/mcp`

## 参考
- 環境ごとの可否: `docs/compatibility_jp.md`
- 設定ファイル例: `config/config.yaml`
