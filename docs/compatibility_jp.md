# 対応環境まとめ (v0.2)

English version: `docs/compatibility.md`

## 目的
notify-mcp の動作環境と通知チャネルの可否を明確にする。

## 前提
- MCPサーバーは Streamable HTTP で提供する
- MCPエンドポイントは `/mcp`
- Web UI は `/` と `/api/*`
- デスクトップ通知は「ホストOS上の desktop-client」が必須
- コンテナ内からホストOSの通知APIに直接アクセスはできない
- リモートMCPの提供は行わない（ローカル/自己ホスト前提）

## 運用方式 (Docker以外も含む)
| 方式 | 用途 | 起動 | 特徴 |
|---|---|---|---|
| Docker 1イメージ | 配布/運用 | `docker run` / `docker compose` | Web UI + MCPを同一コンテナで提供 |
| ローカル(Bun) | 開発/検証 | `bun install` → `bun run server` | 反復が速い。desktop-client と同一ホストで動かしやすい |

## 通知方式 x 環境 (星取表)
記号: `OK`=そのまま動く / `COND`=追加設定が必要 / `NO`=不可

| 環境 | http-webhook | ntfy | desktop | 備考 |
|---|---|---|---|---|
| ローカル (macOS/Linux/Windows) | OK | OK | OK | `desktop-client` を同一ホストで起動 |
| Docker on Linux host | OK | OK | COND | `ws://host.docker.internal:9876` または `--network host` |
| Docker Desktop on macOS | OK | OK | OK | `ws://host.docker.internal:9876` |
| Docker Desktop on Windows | OK | OK | OK | `ws://host.docker.internal:9876` |
| Docker Engine in WSL2 (Windowsホスト) | OK | OK | COND | Windows側で `desktop-client` 起動 + WindowsホストIP指定 |
| VPS / リモートLinux | OK | OK | NO | desktopは不可。push/webhook推奨 |

## MCP + Web UI 対応マトリクス
| 環境 | MCP + Web UI | 推奨設定 | 備考 |
|---|---|---|---|
| ローカル (macOS/Linux/Windows) | OK | `http://localhost:19800` | Bun起動でもDocker起動でも可 |
| Docker on Linux host | OK | `http://localhost:19800` | ローカルポート公開が前提 |
| Docker Desktop on macOS | OK | `http://localhost:19800` |  |
| Docker Desktop on Windows | OK | `http://localhost:19800` |  |
| Docker Engine in WSL2 (Windowsホスト) | OK | `http://localhost:19800` | WSL内でDocker起動 |
| VPS / リモートLinux | OK | `http://<server>:19800` | リモートMCP公開は想定外 |

## WSL2 (Docker Engine) の注意点
- コンテナは WSL2 VM 内にいるため `localhost` は WSL2 内部を指す
- Windows側の `desktop-client` に送るには WindowsホストIPを使う
- 代表的な調べ方: `cat /etc/resolv.conf` の `nameserver` を利用
- Windowsファイアウォールで `9876` の受信許可が必要な場合がある

## Desktop Client の起動場所
- macOS: macOSホスト上
- Windows: Windowsホスト上
- Linux: Linuxホスト上

## 推奨構成
- 開発: ローカル起動 (bun) + desktop-client 同一ホスト
- 配布/運用: Docker 1コンテナ + desktop-client はホストOS側

## 参考: 主要環境変数
- `HOST`: Web/MCPサーバーのbind先 (default `0.0.0.0`)
- `PORT`: Web/MCPサーバーのポート (default `19800`)
- `CONFIG_PATH`: 設定ファイルのパス
