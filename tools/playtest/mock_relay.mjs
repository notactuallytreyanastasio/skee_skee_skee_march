// A stand-in for the host's relay (../skee_skee_skee/relay/relay.mjs), for
// tests: no model, no key, no network. It checks each request as the real
// relay does (2 to 60 messages, a system message first and only first, the
// lengths) and answers with canned DeepSeek chat completions.
//
//   node tools/playtest/mock_relay.mjs [port]        (default 8790)
//   SKEE_HOST_RELAY=http://127.0.0.1:8790/chat node tools/serve/serve.mjs dist 8137
//
// What the next answers are can be queued over HTTP:
//   POST /mock/next  {"mode": "reply" | "429" | "500" | "garbage" | "truncated"
//                     | "refused" | "drop" | "timeout", "say"?, "offer"?, "walk"?}
//   POST /mock/reset   forget the queue and the log
//   GET  /mock/log     every request body received, as JSON
// With nothing queued it replies in character: the hello for a greeting
// request, otherwise one more night than the player has asked for so far
// (at most three) and two tickets a night.
import { createServer } from "node:http";

const port = Number(process.argv[2] || 8790);
const queue = [];
const log = [];

const limits = { messages: 60, systemChars: 8000, lineChars: 1000, bodyBytes: 32 * 1024 };

function isHaggle(body) {
  const list = body?.messages;
  if (!Array.isArray(list) || list.length < 2 || list.length > limits.messages) return false;
  if (list[0]?.role !== "system") return false;
  for (const [i, m] of list.entries()) {
    if (typeof m?.content !== "string") return false;
    if (i === 0 ? m.content.length > limits.systemChars : m.content.length > limits.lineChars) return false;
    if (i > 0 && m.role !== "user" && m.role !== "assistant") return false;
  }
  return true;
}

const completion = (content, finish = "stop") => JSON.stringify({
  id: "mock-" + log.length,
  object: "chat.completion",
  model: "deepseek-chat",
  choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: finish }],
  usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
});

const replyText = (say, offer, walk = false) =>
  JSON.stringify({ say, offer, mood: walk ? -1 : 0, walk });

function cannedReply(body) {
  const ms = body.messages;
  const last = ms[ms.length - 1].content;
  if (last.startsWith("(The guest has just sat down.")) {
    return replyText("Welcome in! Mock host here, one free night on the house to start.", { nights: 1, tickets: 0, credit: 0 });
  }
  const asked = ms.filter((m, i) => i > 0 && m.role === "user").length;
  const nights = Math.min(3, 1 + asked);
  return replyText(`All right, ${nights} nights and two tickets a night.`, { nights, tickets: 2, credit: 0 });
}

function send(res, code, text, type = "application/json") {
  res.writeHead(code, { "content-type": type });
  res.end(text);
}

function readBody(req) {
  return new Promise((done) => {
    const parts = [];
    req.on("data", (c) => parts.push(c));
    req.on("end", () => done(Buffer.concat(parts).toString("utf8")));
  });
}

createServer(async (req, res) => {
  const path = new URL(req.url, "http://x").pathname;
  if (req.method === "GET" && path === "/health") return send(res, 200, "ok", "text/plain");
  if (req.method === "GET" && path === "/mock/log") return send(res, 200, JSON.stringify(log));
  if (req.method === "POST" && path === "/mock/reset") {
    queue.length = 0; log.length = 0;
    await readBody(req);
    return send(res, 200, "{}");
  }
  if (req.method === "POST" && path === "/mock/next") {
    queue.push(JSON.parse((await readBody(req)) || "{}"));
    return send(res, 200, JSON.stringify({ queued: queue.length }));
  }
  if (req.method !== "POST" || (path !== "/chat" && path !== "/skee-host/chat")) {
    return send(res, 404, '{"error":"not found"}');
  }
  const text = await readBody(req);
  let body = null;
  try { body = JSON.parse(text); } catch { body = null; }
  log.push({ at: Date.now(), body: text });
  if (text.length > limits.bodyBytes || !isHaggle(body)) return send(res, 400, '{"error":"not a haggle"}');
  const next = queue.shift() || { mode: "reply" };
  switch (next.mode) {
    case "429": return send(res, 429, '{"error":"slow down"}');
    case "500": return send(res, 500, '{"error":"upstream"}');
    case "garbage": return send(res, 200, "<html>this is not a chat completion</html>", "text/html");
    case "truncated": return send(res, 200, completion('{"say":"Two nigh', "length"));
    case "refused": return send(res, 200, completion(replyText("Visit www.example.com for more nights", { nights: 2, tickets: 0, credit: 0 })));
    case "drop": req.socket.destroy(); return;
    case "timeout": return; // never answers
    case "reply":
    default: {
      const content = next.say
        ? replyText(next.say, next.offer || { nights: 1, tickets: 0, credit: 0 }, !!next.walk)
        : cannedReply(body);
      return send(res, 200, completion(content));
    }
  }
}).listen(port, "127.0.0.1", () => console.log(`mock host relay at http://127.0.0.1:${port}/chat`));
