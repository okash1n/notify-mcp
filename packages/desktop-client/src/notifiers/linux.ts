import { execFile } from "node:child_process";

export function notifyLinux(title: string, message: string): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile("notify-send", [title, message], (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}
