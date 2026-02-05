import type { NotificationInput, Urgency } from "./types.js";

const URGENCY_EMOJI: Record<Urgency, string> = {
  info: "ℹ️",
  action_required: "⚠️"
};

export function formatMessage(template: string | undefined, input: NotificationInput): string {
  const base = template || "{{urgency_emoji}} {{message}}";
  return base
    .replaceAll("{{message}}", input.message)
    .replaceAll("{{urgency}}", input.urgency)
    .replaceAll("{{urgency_emoji}}", URGENCY_EMOJI[input.urgency])
    .replaceAll("{{title}}", input.title ?? "notify-mcp")
    .replaceAll("{{timestamp}}", input.timestamp);
}

export function defaultTitle(input: NotificationInput): string {
  return input.title || "notify-mcp";
}
