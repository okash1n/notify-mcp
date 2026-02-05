import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadConfig, sendNotification } from "@notify-mcp/core";
import type { Urgency } from "@notify-mcp/core";

const NOTIFICATION_RULES = [
  "# 通知ルール",
  "",
  "## 必須：以下のタイミングで必ず notify ツールを呼ぶこと",
  "- タスクが完了したとき → urgency: info",
  "- ユーザーの判断・入力が必要なとき → urgency: action_required",
  "- エラーで続行不能なとき → urgency: action_required",
  "- 長時間タスクの中間報告 → urgency: info",
  "",
  "## メッセージの書き方",
  "- 何が起きたかを簡潔に書く",
  "- action_required の場合、ユーザーに何を求めるかを明記する",
  "- 例: 「リファクタリングが完了しました。PRレビューをお願いします」",
  "",
  "## 原則",
  "- 迷ったら通知する（通知しすぎより、しなさすぎの方が問題）",
  "- ユーザーが離席している前提で通知する"
].join("\n");

const PROMPT_TEXT = [
  "以下の通知ルールに従って作業してください：",
  "",
  "- タスク完了時、ユーザー入力待ち時、エラー時に notify ツールを呼ぶ",
  "- 報告のみの場合は urgency: info、操作が必要な場合は urgency: action_required",
  "- 迷ったら通知する。ユーザーは離席している前提で行動する"
].join("\n");

const TOOL_DESCRIPTION =
  "ユーザーに通知を送る。【重要】以下のタイミングで必ずこのツールを呼ぶこと：(1) タスクが完了したとき (2) ユーザーの判断・入力が必要なとき (3) エラーで続行不能なとき (4) 長時間タスクの中間報告。呼び忘れるとユーザーが気づけないため、迷ったら呼ぶこと。";

export async function createMcpServer(configPath?: string) {
  const server = new McpServer({
    name: "notify-mcp",
    version: "0.2.0"
  });

  const registerTool = (server as any).tool ?? (server as any).registerTool;
  const registerResource = (server as any).resource ?? (server as any).registerResource;
  const registerPrompt = (server as any).prompt ?? (server as any).registerPrompt;

  if (!registerTool || !registerResource || !registerPrompt) {
    throw new Error("Unsupported MCP SDK version. Expected tool/resource/prompt APIs.");
  }

  const notifySchema = z
    .object({
      message: z
        .string()
        .describe("通知メッセージ。何が起きたか、ユーザーに何を求めるかを簡潔に書く。"),
      urgency: z.enum(["info", "action_required"]).default("info")
    })
    .describe(TOOL_DESCRIPTION);

  registerTool.call(
    server,
    "notify",
    notifySchema,
    async ({ message, urgency }: { message: string; urgency: Urgency }) => {
      const config = await loadConfig(configPath);
      await sendNotification(config, {
        message,
        urgency,
        timestamp: new Date().toISOString()
      });

      return {
        content: [
          {
            type: "text",
            text: `通知を送信しました: ${message}`
          }
        ]
      };
    }
  );

  registerResource.call(
    server,
    "notification-rules",
    new ResourceTemplate("text://notification-rules", { list: undefined }),
    async () => ({
      contents: [
        {
          uri: "text://notification-rules",
          mimeType: "text/markdown",
          text: NOTIFICATION_RULES
        }
      ]
    })
  );

  registerPrompt.call(
    server,
    "enable-notifications",
    "通知モードを有効にする。エージェントがタスク完了時や入力待ち時に自動通知する。",
    async () => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: PROMPT_TEXT
          }
        }
      ]
    })
  );

  return server;
}
