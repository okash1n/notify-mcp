import WebSocket from "ws";
import type { ChannelSendResult, DesktopConfig, NotificationInput } from "../types.js";

export async function sendDesktop(
  channel: DesktopConfig,
  input: NotificationInput
): Promise<ChannelSendResult> {
  const payload = {
    title: input.title || "notify-mcp",
    message: input.message,
    urgency: input.urgency,
    timestamp: input.timestamp
  };

  try {
    await new Promise<void>((resolve, reject) => {
      const socket = new WebSocket(channel.endpoint);

      const cleanup = () => {
        socket.removeAllListeners();
      };

      socket.on("open", () => {
        socket.send(JSON.stringify(payload), (err) => {
          if (err) {
            cleanup();
            socket.close();
            reject(err);
            return;
          }
          cleanup();
          socket.close();
          resolve();
        });
      });

      socket.on("error", (err) => {
        cleanup();
        reject(err);
      });
    });

    return {
      channel_id: channel.id || channel.type,
      channel_type: channel.type,
      success: true
    };
  } catch (err: any) {
    return {
      channel_id: channel.id || channel.type,
      channel_type: channel.type,
      success: false,
      error: err?.message || String(err)
    };
  }
}
