import { promises as fs } from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { generateToken } from "./auth.js";
import type { ChannelConfig, Config } from "./types.js";

const DEFAULT_CONFIG: Config = {
  auth: {
    enabled: false,
    token: ""
  },
  channels: [],
  broadcast: true,
  logging: {
    enabled: true,
    db_path: "./data/notify-logs.sqlite"
  }
};

export function resolveConfigPath(configPath?: string): string {
  return configPath || process.env.CONFIG_PATH || path.resolve("./config/config.yaml");
}

export async function loadConfig(configPath?: string): Promise<Config> {
  const resolved = resolveConfigPath(configPath);
  let raw: string | null = null;

  try {
    raw = await fs.readFile(resolved, "utf-8");
  } catch (err: any) {
    if (err?.code !== "ENOENT") {
      throw err;
    }
  }

  let parsed: Partial<Config> = {};
  if (raw) {
    parsed = YAML.parse(raw) ?? {};
  }

  const normalized = normalizeConfig(parsed);

  if (!raw || normalized._needsWrite) {
    await saveConfig(normalized.config, resolved);
  }

  return normalized.config;
}

export async function saveConfig(config: Config, configPath?: string): Promise<void> {
  const resolved = resolveConfigPath(configPath);
  await fs.mkdir(path.dirname(resolved), { recursive: true });
  const data = YAML.stringify(config);
  await fs.writeFile(resolved, data, "utf-8");
}

function normalizeConfig(parsed: Partial<Config>): { config: Config; _needsWrite: boolean } {
  let needsWrite = false;

  const config: Config = {
    auth: {
      enabled: parsed.auth?.enabled ?? DEFAULT_CONFIG.auth.enabled,
      token: parsed.auth?.token ?? DEFAULT_CONFIG.auth.token
    },
    channels: Array.isArray(parsed.channels) ? (parsed.channels as ChannelConfig[]) : [],
    broadcast: parsed.broadcast ?? DEFAULT_CONFIG.broadcast,
    logging: {
      enabled: parsed.logging?.enabled ?? DEFAULT_CONFIG.logging.enabled,
      db_path: parsed.logging?.db_path ?? DEFAULT_CONFIG.logging.db_path
    }
  };

  if (!config.auth.token) {
    config.auth.token = generateToken();
    needsWrite = true;
  }

  const seenIds = new Set<string>();
  config.channels = config.channels.map((channel, index) => {
    if (!channel.id) {
      channel.id = `ch_${channel.type}_${index}_${Math.random().toString(36).slice(2, 8)}`;
      needsWrite = true;
    }
    if (seenIds.has(channel.id)) {
      channel.id = `ch_${channel.type}_${index}_${Math.random().toString(36).slice(2, 8)}`;
      needsWrite = true;
    }
    seenIds.add(channel.id);
    return channel;
  });

  return { config, _needsWrite: needsWrite };
}
