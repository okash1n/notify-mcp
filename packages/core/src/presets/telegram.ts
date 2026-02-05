import type { WebhookPreset } from "./types.js";

export const telegramPreset: WebhookPreset = {
  name: "telegram",
  buildBody: (formatted) => ({
    text: formatted
  })
};
