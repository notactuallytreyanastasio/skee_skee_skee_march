// A static file server for dist/ (make serve), and the host's relay route.
// python3 -m http.server is refused on this machine's loopback (the
// connection times out), so this is node's http module with the MIME types
// the game needs.
//   node tools/serve/serve.mjs <dir> [port]
//
// POST /skee-host/chat is the only route that is not a file. The browser
// sends the host's request here (same origin, so no CORS and no key in the
// page); this forwards the body unchanged to the real relay and hands back
// its status and body as they came. The relay holds the DeepSeek key and
// fixes the model and limits (../skee_skee_skee/relay/relay.mjs); nothing
// here knows a key. SKEE_HOST_RELAY overrides the upstream, for tests
// against tools/playtest/mock_relay.mjs.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { gzipSync } from "node:zlib";
import { Readable } from "node:stream";

const root = resolve(process.argv[2] || "dist");
const port = Number(process.argv[3] || 8137);
const upstream = process.env.SKEE_HOST_RELAY || "https://bobbby.online/skee-host/chat";
// relay.mjs's own limit on a request body; bigger is refused here, unsent.
const bodyLimit = 32 * 1024;
// Under the browser's 30 s (DeepSeek.timeout), so a hung upstream comes
// back as an HTTP answer the player can retry, not a dropped connection.
const upstreamTimeoutMs = 28_000;
const types = {
  ".html": "text/html; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".map": "application/json",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".wav": "audio/wav",
};

const json = (res, code, text) => {
  res.writeHead(code, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  res.end(text);
};

// The body, or null once it passes the limit (the rest is drained, unread).
function readBody(req) {
  return new Promise((done, fail) => {
    let size = 0, over = false;
    const parts = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > bodyLimit) over = true; else parts.push(c);
    });
    req.on("end", () => done(over ? null : Buffer.concat(parts)));
    req.on("error", fail);
  });
}

async function relay(req, res) {
  if (Number(req.headers["content-length"] || 0) > bodyLimit) {
    json(res, 413, '{"error":"too large"}');
    req.resume();
    return;
  }
  let body;
  try { body = await readBody(req); } catch { json(res, 400, '{"error":"bad request"}'); return; }
  if (body === null) { json(res, 413, '{"error":"too large"}'); return; }
  let r;
  try {
    r = await fetch(upstream, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      signal: AbortSignal.timeout(upstreamTimeoutMs),
    });
  } catch (e) {
    console.error("host relay unreachable:", e.name);
    json(res, e.name === "TimeoutError" ? 504 : 502, '{"error":"upstream"}');
    return;
  }
  res.writeHead(r.status, {
    "Content-Type": r.headers.get("content-type") || "application/json",
    "Cache-Control": "no-store",
  });
  if (!r.body) { res.end(); return; }
  Readable.fromWeb(r.body).on("error", () => res.destroy()).pipe(res);
}

createServer((req, res) => {
  serve(req, res).catch((e) => {
    console.error("request failed:", e && e.message);
    if (!res.headersSent) res.writeHead(500, { "Content-Type": "text/plain" });
    res.end();
  });
}).listen(port, "127.0.0.1", () => console.log(`serving ${root} at http://127.0.0.1:${port}/, host relay -> ${upstream}`));

async function serve(req, res) {
  let path;
  try { path = decodeURIComponent(new URL(req.url, "http://x").pathname); }
  catch { res.writeHead(400, { "Content-Type": "text/plain" }).end("bad path"); return; }
  if (path === "/skee-host/chat") {
    if (req.method !== "POST") { json(res, 405, '{"error":"POST only"}'); req.resume(); return; }
    await relay(req, res);
    return;
  }
  const file = normalize(join(root, path.endsWith("/") ? path + "index.html" : path));
  if (file !== root && !file.startsWith(root.endsWith(sep) ? root : root + sep)) { res.writeHead(403).end(); return; }
  try {
    const body = await readFile(file);
    const type = types[extname(file)] || "application/octet-stream";
    const head = { "Content-Type": type, "Cache-Control": "no-store", "Vary": "Accept-Encoding" };
    // Text gzipped when the client takes it: skee.mjs is 5.4 MB raw, ~0.5 MB gzipped.
    const text = /^(text\/|application\/json)/.test(type);
    if (text && /\bgzip\b/.test(req.headers["accept-encoding"] || "")) {
      const packed = gzipSync(body);
      res.writeHead(200, { ...head, "Content-Encoding": "gzip", "Content-Length": packed.length });
      res.end(packed);
    } else {
      res.writeHead(200, { ...head, "Content-Length": body.length });
      res.end(body);
    }
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" }).end("not found");
  }
}
