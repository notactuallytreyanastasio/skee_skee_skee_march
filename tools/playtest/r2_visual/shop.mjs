// Lever drag; lose a run fast with dud flicks; game over; prize shop buy; title shop; how to play.
import { launch, open, shot, marks, text, sleep, press, waitFor, PHONE, DESK } from "./lib.mjs";
const which = process.argv[2] || "phone"; const vp = which === "phone" ? PHONE : DESK, touch = which === "phone";
const b = await launch(); const { page, log } = await open(b, vp);
const cdp = await page.target().createCDPSession();
await press(page, "TapStart", touch);
for (let i = 0; i < 8; i++) { const m = await marks(page); if (m.live.includes("TapArrivalNext")) await press(page, "TapArrivalNext", touch); }
await press(page, "TapCloseHost", touch); await press(page, "TapSkipWalkthrough", touch); await sleep(300);
const knob = await page.evaluate(() => { const e = document.querySelector('#hud .hb[data-intent="TapPull"]'); const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
console.log("knob at " + knob);
// drag the knob down 160 px over 300 ms
async function drag(x, y, dy, ms) {
  if (touch) { await page.touchscreen.touchStart(x, y); for (let i = 1; i <= 12; i++) { await sleep(ms / 12); await page.touchscreen.touchMove(x, y + dy * i / 12); } await page.touchscreen.touchEnd(); }
  else { await page.mouse.move(x, y); await page.mouse.down(); for (let i = 1; i <= 12; i++) { await sleep(ms / 12); await page.mouse.move(x, y + dy * i / 12); } await page.mouse.up(); }
}
await drag(knob[0], knob[1], 40, 300); await sleep(150);
let m = await marks(page); console.log("after short drag (40px): busy=" + m.busy + " live " + m.live.join(","));
await shot(page, `${which}-l1-shortdrag`);
if (m.busy === "0") { await drag(knob[0], knob[1], 200, 350); await sleep(120); m = await marks(page); console.log("after long drag (200px): busy=" + m.busy); await shot(page, `${which}-l2-longdrag`); }
await waitFor(page, (m) => m.busy === "0", "reels", 15000);
// dud flicks until the run ends
async function dud() { const mm = await marks(page); const x = vp.width / 2, y0 = vp.height - 70; const D = y0 - mm.crease - 12;
  const base = Date.now() / 1000 + 0.03, n = 40, dt = 1 / 60; const wait = async (i) => { while (Date.now() / 1000 < base + i * dt) await new Promise((r) => setImmediate(r)); };
  const send = (type, i, pts) => touch ? cdp.send("Input.dispatchTouchEvent", { type, touchPoints: pts, timestamp: base + i * dt }) : cdp.send("Input.dispatchMouseEvent", { type, x: pts[0]?.x ?? x, y: pts[0]?.y ?? y0 - D, button: "left", buttons: type === "mouseReleased" ? 0 : 1, clickCount: 1, timestamp: base + i * dt });
  await wait(0); await send(touch ? "touchStart" : "mousePressed", 0, [{ x, y: y0 }]);
  for (let i = 1; i <= n; i++) { await wait(i); await send(touch ? "touchMove" : "mouseMoved", i, [{ x, y: y0 - D * i / n }]); }
  await send(touch ? "touchEnd" : "mouseReleased", n, []); }
if (process.env.LEVER_ONLY) { await b.close(); process.exit(0); }
for (let g = 0; g < 80; g++) {
  m = await marks(page);
  if (m.live.includes("TapNewRun")) break;
  if (m.live.includes("TapGotIt")) { await press(page, "TapGotIt", touch); continue; }
  if (m.live.includes("TapPull") && m.busy === "0" && m.layer === "LayerBase") { await press(page, "TapPull", touch); await waitFor(page, (m) => m.busy === "0", "reels", 15000); continue; }
  if (m.canThrow === "1" && m.busy === "0" && m.layer === "LayerBase") { await dud(); await sleep(200); await waitFor(page, (m) => m.busy === "0", "settle", 25000); continue; }
  await sleep(200);
}
await sleep(800);
console.log("game over: " + (await shot(page, `${which}-g1-over`)) + " | " + (await text(page)).slice(-200));
m = await marks(page); console.log("live " + m.live.join(","));
await press(page, "TapOpenShop", touch); await sleep(400);
console.log("shop: " + (await shot(page, `${which}-g2-shop`)) + " | " + (await text(page)).slice(-500));
m = await marks(page); console.log("live " + m.live.join(","));
const buy = m.live.find((x) => /Buy|Prize/.test(x) && !/Close/.test(x));
if (buy) { await press(page, buy, touch); await sleep(500); console.log("bought " + buy + ": " + (await shot(page, `${which}-g3-shop-bought`)) + " | " + (await text(page)).slice(-300)); }
await press(page, "TapCloseShop", touch); await sleep(300);
m = await marks(page); console.log("after shop live " + m.live.join(","));
if (m.live.includes("TapNewRun")) { await press(page, "TapNewRun", touch); await sleep(800); console.log("new run: " + (await shot(page, `${which}-g4-newrun`)) + " | " + (await text(page)).slice(0, 200)); }
m = await marks(page); console.log("live " + m.live.join(","));
// reload: title or game?
await page.reload({ waitUntil: "load" }); await sleep(900);
m = await marks(page); console.log("after reload: " + JSON.stringify(m) + " " + (await shot(page, `${which}-g5-reload`)));
console.log(log.filter((l) => !/^(log|debug|info)/.test(l)).join("\n"));
await b.close();
