import type { WebhookPreset } from "./types.js";

export const discordPreset: WebhookPreset = {
  name: "discord",
  buildBody: (formatted) => ({
    content: formatted
  })
};
