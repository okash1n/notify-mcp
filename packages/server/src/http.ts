import http from "node:http";
import { Readable } from "node:stream";
import { randomUUID } from "node:crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createWebApp } from "@notify-mcp/web";
import { loadConfig } from "@notify-mcp/core";
import { createMcpServer } from "./mcp.js";

const PORT = Number(process.env.PORT || 19800);
const HOST = process.env.HOST || "0.0.0.0";
const MCP_PATH = "/mcp";

async function main() {
  const configPath = process.env.CONFIG_PATH;
  const webApp = createWebApp({ configPath });
  const mcpServer = await createMcpServer(configPath);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID()
  });

  await mcpServer.connect(transport);

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

      if (url.pathname.startsWith(MCP_PATH)) {
        if (!(await authorize(req, configPath))) {
          res.statusCode = 401;
          res.end("Unauthorized");
          return;
        }

        if (!isAllowedOrigin(req)) {
          res.statusCode = 403;
          res.end("Forbidden");
          return;
        }

        if (req.method === "OPTIONS") {
          res.statusCode = 204;
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Headers", "authorization, content-type");
          res.end();
          return;
        }

        const parsedBody = await parseJsonBody(req);
        await transport.handleRequest(req, res, parsedBody ?? undefined);
        return;
      }

      const response = await webApp.fetch(toRequest(req));
      await sendResponse(res, response);
    } catch (err: any) {
      res.statusCode = 500;
      res.end(err?.message || "Internal Server Error");
    }
  });

  server.listen(PORT, HOST, () => {
    console.log(`notify-mcp listening on http://${HOST}:${PORT}`);
  });
}

function toRequest(req: http.IncomingMessage): Request {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === "undefined") continue;
    headers.set(key, Array.isArray(value) ? value.join(",") : value);
  }
  const method = req.method || "GET";
  const body = method === "GET" || method === "HEAD" ? undefined : (req as any);
  return new Request(url, {
    method,
    headers,
    body,
    duplex: "half" as any
  });
}

async function sendResponse(res: http.ServerResponse, response: Response) {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  if (!response.body) {
    res.end();
    return;
  }

  const stream = Readable.fromWeb(response.body as any);
  stream.pipe(res);
}

async function parseJsonBody(req: http.IncomingMessage): Promise<any | null> {
  const contentType = req.headers["content-type"] || "";
  if (!String(contentType).includes("application/json")) {
    return null;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }
  if (!chunks.length) return null;

  const text = Buffer.concat(chunks).toString("utf-8");
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function isAllowedOrigin(req: http.IncomingMessage): boolean {
  const originHeader = req.headers.origin;
  if (!originHeader) return true;

  const origin = Array.isArray(originHeader) ? originHeader[0] : originHeader;
  try {
    const originUrl = new URL(origin);
    const hostHeader = req.headers.host;
    const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader;

    if (host) {
      const hostUrl = new URL(`http://${host}`);
      if (originUrl.hostname === hostUrl.hostname) return true;
    }

    if (originUrl.hostname === "localhost" || originUrl.hostname === "127.0.0.1") {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

async function authorize(req: http.IncomingMessage, configPath?: string): Promise<boolean> {
  const config = await loadConfig(configPath);
  if (!config.auth.enabled) return true;
  const authHeader = req.headers.authorization;
  const auth = Array.isArray(authHeader) ? authHeader[0] : authHeader;
  if (!auth || !auth.startsWith("Bearer ")) return false;
  const token = auth.slice("Bearer ".length).trim();
  return token === config.auth.token;
}

void main();
