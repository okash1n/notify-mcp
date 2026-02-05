import { Hono } from "hono";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { promises as fs } from "node:fs";
import {
  loadConfig,
  saveConfig,
  sendNotification,
  listPresets,
  listLogs,
  generateToken
} from "@notify-mcp/core";
import type { ChannelConfig, Urgency } from "@notify-mcp/core";

export function createWebApp(options?: { configPath?: string }) {
  const app = new Hono();
  const configPath = options?.configPath;
  const staticDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../frontend");

  app.use("/api/*", async (c, next) => {
    const config = await loadConfig(configPath);
    if (!config.auth.enabled) {
      return next();
    }

    const auth = c.req.header("authorization");
    if (!auth?.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const token = auth.slice("Bearer ".length).trim();
    if (token !== config.auth.token) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    return next();
  });

  app.get("/api/config", async (c) => {
    const config = await loadConfig(configPath);
    return c.json({ broadcast: config.broadcast, logging: config.logging });
  });

  app.put("/api/config", async (c) => {
    const config = await loadConfig(configPath);
    const body = await c.req.json();

    if (typeof body.broadcast === "boolean") {
      config.broadcast = body.broadcast;
    }

    if (body.logging && typeof body.logging === "object") {
      if (typeof body.logging.enabled === "boolean") {
        config.logging.enabled = body.logging.enabled;
      }
      if (typeof body.logging.db_path === "string") {
        config.logging.db_path = body.logging.db_path;
      }
    }

    await saveConfig(config, configPath);
    return c.json({ broadcast: config.broadcast, logging: config.logging });
  });

  app.get("/api/channels", async (c) => {
    const config = await loadConfig(configPath);
    return c.json({ channels: config.channels });
  });

  app.post("/api/channels", async (c) => {
    const config = await loadConfig(configPath);
    const channel = (await c.req.json()) as ChannelConfig;
    if (!channel.id) {
      channel.id = `ch_${channel.type}_${Math.random().toString(36).slice(2, 8)}`;
    }
    config.channels.push(channel);
    await saveConfig(config, configPath);
    return c.json({ channel });
  });

  app.put("/api/channels/:id", async (c) => {
    const config = await loadConfig(configPath);
    const id = c.req.param("id");
    const update = (await c.req.json()) as ChannelConfig;
    const index = config.channels.findIndex((channel) => channel.id === id);
    if (index === -1) {
      return c.json({ error: "Not found" }, 404);
    }
    config.channels[index] = { ...config.channels[index], ...update, id };
    await saveConfig(config, configPath);
    return c.json({ channel: config.channels[index] });
  });

  app.delete("/api/channels/:id", async (c) => {
    const config = await loadConfig(configPath);
    const id = c.req.param("id");
    const nextChannels = config.channels.filter((channel) => channel.id !== id);
    if (nextChannels.length === config.channels.length) {
      return c.json({ error: "Not found" }, 404);
    }
    config.channels = nextChannels;
    await saveConfig(config, configPath);
    return c.json({ ok: true });
  });

  app.get("/api/presets", async (c) => {
    const presets = listPresets().map((preset) => ({ name: preset.name }));
    return c.json({ presets });
  });

  app.post("/api/test", async (c) => {
    const config = await loadConfig(configPath);
    const body = await c.req.json();
    const message = String(body.message ?? "Test notification");
    const urgency = (body.urgency ?? "info") as Urgency;
    const channelIds = Array.isArray(body.channel_ids) ? body.channel_ids : undefined;

    const results = await sendNotification(
      config,
      {
        message,
        urgency,
        timestamp: new Date().toISOString()
      },
      { channelIds }
    );

    return c.json({ results });
  });

  app.get("/api/logs", async (c) => {
    const config = await loadConfig(configPath);
    const query = {
      urgency: c.req.query("urgency") as Urgency | undefined,
      status: c.req.query("status") as "success" | "failed" | undefined,
      channel: c.req.query("channel") as string | undefined,
      limit: c.req.query("limit") ? Number(c.req.query("limit")) : undefined,
      offset: c.req.query("offset") ? Number(c.req.query("offset")) : undefined
    };
    const logs = await listLogs(config.logging, query);
    return c.json({ logs });
  });

  app.get("/api/auth", async (c) => {
    const config = await loadConfig(configPath);
    return c.json({ enabled: config.auth.enabled, token: config.auth.token });
  });

  app.post("/api/auth/token", async (c) => {
    const config = await loadConfig(configPath);
    const body = await c.req.json();
    const regenerate = Boolean(body.regenerate);
    const enabled = body.enabled;
    if (typeof enabled === "boolean") {
      config.auth.enabled = enabled;
    }
    if (regenerate || !config.auth.token) {
      config.auth.token = generateToken();
    }
    await saveConfig(config, configPath);
    return c.json({ enabled: config.auth.enabled, token: config.auth.token });
  });

  app.get("/health", (c) => c.json({ ok: true }));

  app.get("/", async (c) => {
    const html = await fs.readFile(path.join(staticDir, "index.html"), "utf-8");
    return c.html(html);
  });

  app.get("/app.js", async (c) => {
    const js = await fs.readFile(path.join(staticDir, "app.js"), "utf-8");
    c.header("Content-Type", "application/javascript");
    return c.body(js);
  });

  app.get("/styles.css", async (c) => {
    const css = await fs.readFile(path.join(staticDir, "styles.css"), "utf-8");
    c.header("Content-Type", "text/css");
    return c.body(css);
  });

  return app;
}
