export interface WebhookPreset {
  name: string;
  headers?: Record<string, string>;
  buildBody: (formatted: string) => unknown;
}
