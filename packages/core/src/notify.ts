import type { ChannelConfig, ChannelSendResult, Config, NotificationInput } from "./types.js";
import { sendHttpWebhook } from "./channels/http-webhook.js";
import { sendNtfy } from "./channels/ntfy.js";
import { sendDesktop } from "./channels/desktop.js";
import { logNotification } from "./logging.js";

export async function sendNotification(
  config: Config,
  input: NotificationInput,
  options?: { channelIds?: string[] }
): Promise<ChannelSendResult[]> {
  const enabledChannels = config.channels.filter((channel) => channel.enabled);

  const channels = filterChannels(config, enabledChannels, input, options?.channelIds);

  const results: ChannelSendResult[] = [];
  for (const channel of channels) {
    if (!channel.enabled) continue;
    if (channel.only_urgency && !channel.only_urgency.includes(input.urgency)) {
      continue;
    }

    switch (channel.type) {
      case "http-webhook":
        results.push(await sendHttpWebhook(channel, input));
        break;
      case "ntfy":
        results.push(await sendNtfy(channel, input));
        break;
      case "desktop":
        results.push(await sendDesktop(channel, input));
        break;
      default:
        results.push({
          channel_id: channel.id || channel.type,
          channel_type: channel.type,
          success: false,
          error: `Unsupported channel type: ${channel.type}`
        });
    }
  }

  const failed = results.filter((result) => !result.success);
  await logNotification(config.logging, {
    timestamp: input.timestamp,
    urgency: input.urgency,
    message: input.message,
    channels: results.map((result) => result.channel_id),
    status: failed.length ? "failed" : "success",
    error: failed.map((entry) => `${entry.channel_id}: ${entry.error}`).join(" | ") || null
  });

  return results;
}

function filterChannels(
  config: Config,
  channels: ChannelConfig[],
  input: NotificationInput,
  channelIds?: string[]
): ChannelConfig[] {
  if (channelIds && channelIds.length) {
    return channels.filter((channel) => channel.id && channelIds.includes(channel.id));
  }

  if (config.broadcast) {
    return channels;
  }

  return channels.filter((channel) => channel.only_urgency?.includes(input.urgency));
}
