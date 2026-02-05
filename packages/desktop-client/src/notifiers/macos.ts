import { execFile } from "node:child_process";

export function notifyMacos(title: string, message: string): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile(
      "osascript",
      [
        "-e",
        `display notification ${JSON.stringify(message)} with title ${JSON.stringify(title)}`
      ],
      (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      }
    );
  });
}
