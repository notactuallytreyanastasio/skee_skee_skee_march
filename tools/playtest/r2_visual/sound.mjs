// The sound cue timeline over a pull and three balls of a frame (walkthrough skipped), cues named, times from the gesture.
import { launch, open, marks, text, sleep, press, waitFor, PHONE } from "./lib.mjs";
const b = await launch(); const { page } = await open(b, PHONE); const touch = true;
const cdp = await page.target().createCDPSession();
await page.evaluate(() => { window.__ev = []; for (const k of ["pointerdown", "pointerup", "touchstart", "touchend", "pointercancel"]) addEventListener(k, (e) => window.__ev.push([k, performance.now() / 1000, e.timeStamp / 1000]), true); });
await press(page, "TapStart", touch);
for (let i = 0; i < 8; i++) { const m = await marks(page); if (m.live.includes("TapArrivalNext")) await press(page, "TapArrivalNext", touch); }
await press(page, "TapCloseHost", touch); await press(page, "TapSkipWalkthrough", touch); await sleep(300);
const T = async () => page.evaluate(() => performance.now() / 1000);
const dump = async (from, label) => {
  const rows = await page.evaluate((from) => (window.__skeeAudio.log || []).filter((e) => e.t >= from).map((e) => [e.t, e.cmds.filter((c) => !c.startsWith("CmdRumble")).join(" ")]).filter((r) => r[1]), from);
  const ev = await page.evaluate((from) => window.__ev.filter((e) => e[1] >= from), from);
  console.log(`--- ${label}  events: ` + ev.map((e) => `${e[0]}@+${(e[1] - from).toFixed(3)} (stamp +${(e[2] - from).toFixed(3)})`).join(" ")); for (const [t, c] of rows) console.log(`  +${(t - from).toFixed(3)}s ${c}`);
  const st = await page.evaluate(() => window.__skeeAudio.stats); console.log("  stats " + JSON.stringify(st));
};
async function mj(T0) { // a good flick
  const x = 195, y0 = 774, m = await marks(page), D = (y0 - (m.crease + 12)) * 1.25, dt = 1 / 120, n = Math.round(0.24 / dt), cut = Math.round(n * .8);
  const base = Date.now() / 1000 + 0.05, pos = (i) => { const u = i / n; return 10 * u ** 3 - 15 * u ** 4 + 6 * u ** 5; };
  const wait = async (i) => { while (Date.now() / 1000 < base + i * dt) await new Promise((r) => setImmediate(r)); };
  const send = (type, i, pts) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: pts, timestamp: base + i * dt });
  await wait(0); await send("touchStart", 0, [{ x, y: y0 }]);
  for (let i = 1; i <= cut; i++) { await wait(i); await send("touchMove", i, [{ x, y: y0 - D * pos(i) }]); }
  await wait(cut + .5); await send("touchEnd", cut + .5, []);
}
let t0 = await T(); await press(page, "TapPull", touch); await waitFor(page, (m) => m.busy === "0", "reels", 15000); await sleep(300); await dump(t0, "pull (SPIN tap)");
for (let k = 0; k < 2; k++) {
  let m = await marks(page);
  for (let g = 0; g < 20 && !(m.canThrow === "1" && m.busy === "0" && m.layer === "LayerBase"); g++) { if (m.live.includes("TapGotIt")) await press(page, "TapGotIt", touch); else await sleep(200); m = await marks(page); }
  t0 = await T(); await mj(); await sleep(200); await waitFor(page, (m) => m.busy === "0", "settle", 25000); await sleep(1500);
  await dump(t0, `ball ${k + 1}: ` + (await text(page)).match(/(GUTTER|\+\d+|FRAME \d\/3 · \d BALLS)/g)?.join(" "));
}
// lever drag instead of SPIN
let m = await marks(page);
for (let g = 0; g < 20 && !m.live.includes("TapPull"); g++) { if (m.live.includes("TapGotIt")) await press(page, "TapGotIt", touch); else await sleep(200); m = await marks(page); }
const knob = await page.evaluate(() => { const els = [...document.querySelectorAll('#hud [data-intent="TapPull"]')]; return els.map((e) => { const r = e.getBoundingClientRect(); return [e.className, Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2), Math.round(r.width), Math.round(r.height)]; }); });
console.log("TapPull elements: " + JSON.stringify(knob));
await b.close();
