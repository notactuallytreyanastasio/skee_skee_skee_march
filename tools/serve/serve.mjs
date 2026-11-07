// A static file server for dist/ (make serve). python3 -m http.server is
// refused on this machine's loopback (the connection times out), so this is
// node's http module with the MIME types the game needs.
//   node tools/serve/serve.mjs <dir> [port]
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { gzipSync } from "node:zlib";

const root = resolve(process.argv[2] || "dist");
const port = Number(process.argv[3] || 8137);
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

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const file = normalize(join(root, path.endsWith("/") ? path + "index.html" : path));
  if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
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
}).listen(port, "127.0.0.1", () => console.log(`serving ${root} at http://127.0.0.1:${port}/`));
