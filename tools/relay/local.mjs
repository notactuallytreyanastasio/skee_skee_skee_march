// Runs the casino host's relay (relay.mjs, copied from the Swift project's
// relay/) on this Mac, bound to 127.0.0.1 only, so the key never leaves here
// and nothing on the LAN or tailnet can reach the keyed door directly.
// tools/serve/serve.mjs forwards the browser's POST /skee-host/chat to it.
//
//   node tools/relay/local.mjs            (port 8788, or PORT)
//
// The key comes from the macOS keychain item "skee-deepseek" (store it once
// with: security add-generic-password -s skee-deepseek -a "$USER" -w), or from
// DEEPSEEK_API_KEY. It is never printed or written to disk.
import { execFileSync } from "node:child_process";
import { makeServer } from "./relay.mjs";

function keychainKey() {
  try {
    return execFileSync("security", ["find-generic-password", "-s", "skee-deepseek", "-w"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

const key = process.env.DEEPSEEK_API_KEY || keychainKey();
if (!key) {
  console.error('no DeepSeek key: run  security add-generic-password -s skee-deepseek -a "$USER" -w');
  process.exit(1);
}
const port = Number(process.env.PORT || 8788);
makeServer({ key }).listen(port, "127.0.0.1", () => console.log(`relay on http://127.0.0.1:${port}/chat`));
