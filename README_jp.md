# notify-mcp (日本語)

LLMエージェント向けの汎用通知MCPサーバー。`notify` ツール1つで、タスク完了・入力待ち・エラー時にユーザーへ通知を届けるための仕組みを提供します。

- MCP: Streamable HTTP (`/mcp`)
- Web UI: `/` + `/api/*`
- 通知チャネル: `http-webhook`, `ntfy`, `desktop`
- 通知ログ: SQLite

## クイックスタート (Docker)

```bash
# 1) 起動
# docker compose が使えない場合は docker-compose を利用してください。
docker compose up -d

# 2) Web UI
# http://localhost:19800
```

`config/config.yaml` を編集してチャネルを追加・調整できます。
Web UIからチャネル追加や設定変更も可能です。

## GHCR イメージ

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

## ローカル起動 (Docker無し)

```bash
bun install
bun run server
```

- デフォルト: `http://localhost:19800`
- `CONFIG_PATH` を指定すると設定ファイルの場所を変えられます

## Desktop通知

`desktop` チャネルを使う場合は、**通知を出すホストOS上で desktop-client を起動**してください。

```bash
bun run desktop
```

- Web UI / MCP がDockerで動いている場合でも、desktop-client はホスト側で起動する必要があります
- WSL2 + Docker Engine の場合は、`desktop` endpoint に WindowsホストIP を設定します

## MCPホスト設定

MCPホストの設定は「HTTPエンドポイント」を指定する形になります。

`http://<host>:19800/mcp`

## 検証済み手順

v0.2.0 の検証に使ったコマンドは `docs/verified_jp.md` にまとめています。

**ドキュメント (EN)**
- `README.md`
- `docs/installation.md`
- `docs/compatibility.md`
- `docs/verified.md`

**ドキュメント (JP)**
- `docs/installation_jp.md`
- `docs/compatibility_jp.md`
- `docs/verified_jp.md`
