import type { WebhookPreset } from "./types.js";

export const slackPreset: WebhookPreset = {
  name: "slack",
  buildBody: (formatted) => ({
    text: formatted
  })
};
