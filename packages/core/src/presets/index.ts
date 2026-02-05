import { slackPreset } from "./slack.js";
import { discordPreset } from "./discord.js";
import { telegramPreset } from "./telegram.js";
import type { WebhookPreset } from "./types.js";

const presets: WebhookPreset[] = [slackPreset, discordPreset, telegramPreset];

export function getPreset(name?: string): WebhookPreset | undefined {
  if (!name) return undefined;
  return presets.find((preset) => preset.name === name);
}

export function listPresets(): WebhookPreset[] {
  return presets;
}

export type { WebhookPreset } from "./types.js";
