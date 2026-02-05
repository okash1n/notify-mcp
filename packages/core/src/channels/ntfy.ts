import { formatMessage, defaultTitle } from "../template.js";
import type { ChannelSendResult, NtfyConfig, NotificationInput } from "../types.js";

export async function sendNtfy(channel: NtfyConfig, input: NotificationInput): Promise<ChannelSendResult> {
  const formatted = formatMessage(channel.format, input);
  const server = channel.server.replace(/\/$/, "");
  const url = `${server}/${channel.topic}`;
  const priority = channel.priority_map?.[input.urgency];

  const headers: Record<string, string> = {
    "Content-Type": "text/plain",
    "Title": defaultTitle(input)
  };

  if (priority !== undefined) {
    headers["Priority"] = String(priority);
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formatted
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return {
        channel_id: channel.id || channel.type,
        channel_type: channel.type,
        success: false,
        error: `HTTP ${response.status} ${response.statusText} ${text}`.trim()
      };
    }

    return {
      channel_id: channel.id || channel.type,
      channel_type: channel.type,
      success: true
    };
  } catch (err: any) {
    return {
      channel_id: channel.id || channel.type,
      channel_type: channel.type,
      success: false,
      error: err?.message || String(err)
    };
  }
}
