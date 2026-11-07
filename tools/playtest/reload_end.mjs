// Reload at the prize counter and at game over: state comes back, winnings are not paid twice.
import { launch, open, sleep, PHONE } from "./lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8161/";
const dir = new URL("./shots/func2/", import.meta.url).pathname;
const b = await launch();
const g = await open(b, url, PHONE, { "skee.arrivalDone": "true", "skee.walkthroughDone": "true" });
const wallet = () => g.page.evaluate(() => localStorage.getItem("skee.wallet"));
async function reload(tag) {
  await g.page.reload(); await g.page.waitForFunction(() => document.documentElement.getAttribute("data-layer")); await sleep(1200);
  const m = await g.marks(); console.log(`after reload (${tag}): layer=${m.layer} live=${JSON.stringify(m.live)} | ${m.text.slice(0, 260)}`);
  await g.shot(dir + `reload-${tag}.png`);
  return m;
}
await g.press("TapStart");
let phase = "counter";
for (let i = 0; i < 800; i++) {
  let m = await g.marks();
  if (m.live.includes("TapStart")) { console.log("title after reload; tapping play"); await g.press("TapStart"); continue; }
  if (m.live.includes("TapGotIt")) { await g.press("TapGotIt"); continue; }
  if (phase === "counter" && m.live.includes("TapLeaveCounter")) {
    console.log("at counter: " + m.text.match(/PRIZE COUNTER.*?NEXT ROUND/)?.[0]);
    const m2 = await reload("counter");
    console.log("counter survived: " + m2.live.includes("TapLeaveCounter"));
    phase = "lose"; continue;
  }
  if (m.live.includes("TapLeaveCounter")) { await g.press("TapLeaveCounter"); continue; }
  if (/GAME OVER/.test(m.text) && m.live.includes("TapNewRun")) {
    const w0 = await wallet(); console.log("game over wallet " + w0);
    await reload("gameover"); await reload("gameover2");
    const w1 = await wallet(); console.log("wallet after 2 reloads " + w1 + " same=" + (w0 === w1));
    break;
  }
  if (m.busy === "1") { await sleep(80); continue; }
  if (m.can === "1") { await g.flick(phase === "counter" ? { gap: 13 } : { gap: 5, steps: 5 }); await sleep(120); await g.settle(); continue; }
  if (m.live.includes("TapPull")) { await g.press("TapPull"); continue; }
  await sleep(100);
}
console.log("errors " + JSON.stringify(g.errors));
await b.close();
