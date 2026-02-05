export type Urgency = "info" | "action_required";

export interface AuthConfig {
  enabled: boolean;
  token: string;
}

export interface LoggingConfig {
  enabled: boolean;
  db_path: string;
}

export interface BaseChannelConfig {
  id?: string;
  type: string;
  enabled: boolean;
  format?: string;
  only_urgency?: Urgency[];
}

export interface HttpWebhookConfig extends BaseChannelConfig {
  type: "http-webhook";
  preset?: string;
  url: string;
  headers?: Record<string, string>;
}

export interface NtfyConfig extends BaseChannelConfig {
  type: "ntfy";
  topic: string;
  server: string;
  priority_map?: Partial<Record<Urgency, number>>;
}

export interface DesktopConfig extends BaseChannelConfig {
  type: "desktop";
  endpoint: string;
}

export type ChannelConfig = HttpWebhookConfig | NtfyConfig | DesktopConfig;

export interface Config {
  auth: AuthConfig;
  channels: ChannelConfig[];
  broadcast: boolean;
  logging: LoggingConfig;
}

export interface NotificationInput {
  message: string;
  urgency: Urgency;
  title?: string;
  timestamp: string;
}

export interface ChannelSendResult {
  channel_id: string;
  channel_type: string;
  success: boolean;
  error?: string;
}
