import os from "node:os";
import { WebSocketServer } from "ws";
import { notifyMacos } from "./notifiers/macos.js";
import { notifyWindows } from "./notifiers/windows.js";
import { notifyLinux } from "./notifiers/linux.js";

const PORT = Number(process.env.DESKTOP_PORT || 9876);

interface DesktopPayload {
  title?: string;
  message: string;
  urgency?: "info" | "action_required";
  timestamp?: string;
}

const platform = os.platform();

async function notify(payload: DesktopPayload) {
  const title = payload.title || "notify-mcp";
  const message = payload.message || "";

  if (platform === "darwin") {
    await notifyMacos(title, message);
    return;
  }

  if (platform === "win32") {
    await notifyWindows(title, message);
    return;
  }

  await notifyLinux(title, message);
}

const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (socket) => {
  socket.on("message", async (data) => {
    try {
      const payload = JSON.parse(data.toString()) as DesktopPayload;
      await notify(payload);
    } catch (err) {
      console.error("desktop-client error", err);
    }
  });
});

console.log(`desktop-client listening on ws://localhost:${PORT}`);
