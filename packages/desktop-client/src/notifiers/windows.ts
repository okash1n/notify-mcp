import { execFile } from "node:child_process";

export function notifyWindows(title: string, message: string): Promise<void> {
  const script = `Add-Type -AssemblyName PresentationFramework; [System.Windows.MessageBox]::Show(${JSON.stringify(message)}, ${JSON.stringify(title)})`;
  return new Promise((resolve, reject) => {
    execFile("powershell.exe", ["-Command", script], (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}
