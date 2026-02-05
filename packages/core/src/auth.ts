import { randomBytes } from "node:crypto";

export function generateToken(): string {
  return `nmcp_${randomBytes(16).toString("hex")}`;
}
