import { Database } from "bun:sqlite";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { LoggingConfig, Urgency } from "./types.js";

export interface LogEntry {
  id?: number;
  timestamp: string;
  urgency: Urgency;
  message: string;
  channels: string[];
  status: "success" | "failed";
  error?: string | null;
}

const dbCache = new Map<string, Database>();

function getDb(dbPath: string): Database {
  const resolved = path.resolve(dbPath);
  if (dbCache.has(resolved)) {
    return dbCache.get(resolved)!;
  }
  const db = new Database(resolved);
  dbCache.set(resolved, db);
  return db;
}

export async function initLogging(config: LoggingConfig): Promise<void> {
  if (!config.enabled) return;
  await fs.mkdir(path.dirname(config.db_path), { recursive: true });
  const db = getDb(config.db_path);
  db.exec(`
    CREATE TABLE IF NOT EXISTS notification_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      urgency TEXT NOT NULL,
      message TEXT NOT NULL,
      channels TEXT NOT NULL,
      status TEXT NOT NULL,
      error TEXT
    );
  `);
}

export async function logNotification(config: LoggingConfig, entry: LogEntry): Promise<void> {
  if (!config.enabled) return;
  await initLogging(config);
  const db = getDb(config.db_path);
  const stmt = db.prepare(
    `INSERT INTO notification_logs (timestamp, urgency, message, channels, status, error)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  stmt.run(
    entry.timestamp,
    entry.urgency,
    entry.message,
    JSON.stringify(entry.channels),
    entry.status,
    entry.error ?? null
  );
}

export interface LogQuery {
  urgency?: Urgency;
  status?: "success" | "failed";
  channel?: string;
  limit?: number;
  offset?: number;
}

export async function listLogs(config: LoggingConfig, query: LogQuery): Promise<LogEntry[]> {
  if (!config.enabled) return [];
  await initLogging(config);
  const db = getDb(config.db_path);

  const clauses: string[] = [];
  const params: Array<string | number> = [];

  if (query.urgency) {
    clauses.push("urgency = ?");
    params.push(query.urgency);
  }
  if (query.status) {
    clauses.push("status = ?");
    params.push(query.status);
  }
  if (query.channel) {
    clauses.push("channels LIKE ?");
    params.push(`%\"${query.channel}\"%`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const limit = query.limit ?? 50;
  const offset = query.offset ?? 0;

  const stmt = db.prepare(
    `SELECT id, timestamp, urgency, message, channels, status, error
     FROM notification_logs
     ${where}
     ORDER BY id DESC
     LIMIT ? OFFSET ?`
  );
  const rows = stmt.all(...params, limit, offset) as Array<any>;

  return rows.map((row) => ({
    id: row.id,
    timestamp: row.timestamp,
    urgency: row.urgency,
    message: row.message,
    channels: JSON.parse(row.channels),
    status: row.status,
    error: row.error
  }));
}
