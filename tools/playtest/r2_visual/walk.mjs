// Follow the walkthrough as a new player: never skip. Log every step.
import { launch, open, shot, marks, text, sleep, press, flick, waitFor, PHONE, DESK } from "./lib.mjs";
const which = process.argv[2] || "phone";
const vp = which === "phone" ? PHONE : DESK, touch = which === "phone";
const b = await launch();
const { page, log } = await open(b, vp);
let n = 0;
const step = async (what) => { const m = await marks(page); const t = await text(page); n++; const p = await shot(page, `${which}-w${String(n).padStart(2, "0")}-${what}`); console.log(`#${n} ${what} ${JSON.stringify(m)}\n    ${t.slice(0, 300)}\n    ${p}`); return m; };
await step("title");
await press(page, "TapStart", touch); await sleep(400);
let m = await step("after-start");
let guard = 0;
while (guard++ < 40) {
  m = await marks(page);
  if (m.live.includes("TapArrivalNext")) { await press(page, "TapArrivalNext", touch); await sleep(300); await step("arrival"); continue; }
  if (m.live.includes("TapCloseHost")) { await press(page, "TapCloseHost", touch); await sleep(300); await step("host-closed"); continue; }
  if (m.live.includes("TapGotIt")) { await press(page, "TapGotIt", touch); await sleep(300); await step("gotit"); continue; }
  if (m.live.includes("TapPull") && m.busy === "0") { await press(page, "TapPull", touch); await sleep(250); await step("pulling"); await waitFor(page, (m) => m.busy === "0", "reels stop", 15000); await step("pulled"); continue; }
  if (m.canThrow === "1" && m.busy === "0") {
    const x = vp.width / 2, y0 = vp.height - 60;
    await flick(page, touch, x, y0, x + 6, m.crease + 15, 8, 16);
    await sleep(500); await step("rolling");
    await waitFor(page, (m) => m.busy === "0", "settle", 20000); await step("settled"); continue;
  }
  console.log("stuck? live=" + m.live.join(","));
  await sleep(1000); await step("wait");
  if (guard > 30) break;
}
console.log(log.filter((l) => !l.startsWith("log") && !l.startsWith("debug")).join("\n"));
await b.close();
