import { formatMessage } from "../template.js";
import { getPreset } from "../presets/index.js";
import type { ChannelSendResult, HttpWebhookConfig, NotificationInput } from "../types.js";

export async function sendHttpWebhook(
  channel: HttpWebhookConfig,
  input: NotificationInput
): Promise<ChannelSendResult> {
  const formatted = formatMessage(channel.format, input);
  const preset = getPreset(channel.preset);
  const body = preset ? preset.buildBody(formatted) : { message: formatted };
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(preset?.headers ?? {}),
    ...(channel.headers ?? {})
  };

  try {
    const response = await fetch(channel.url, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
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
