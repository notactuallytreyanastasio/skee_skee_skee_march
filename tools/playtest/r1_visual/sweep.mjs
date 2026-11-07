// Straight constant-speed flicks at set speeds: what does each do? Also frame timing under 4x CPU throttle.
import { launch, open, shot, marks, text, sleep, press, waitFor, PHONE, DESK } from "./lib.mjs";
const which = process.argv[2] || "phone"; const throttle = Number(process.argv[3] || 1);
const vp = which === "phone" ? PHONE : DESK, touch = which === "phone";
const b = await launch();
const page = await b.newPage();
await page.evaluateOnNewDocument(() => {
  window.__ft = { cb: [], gap: [], last: 0, on: false };
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (f) => raf((t) => { const s = performance.now(); f(t); const d = performance.now() - s; const ft = window.__ft; if (ft.on) { ft.cb.push(d); if (ft.last) ft.gap.push(t - ft.last); } ft.last = t; });
});
await page.setViewport(vp);
await page.goto("http://127.0.0.1:8191/", { waitUntil: "load" }); await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: "load" }); await sleep(700);
const cdp = await page.target().createCDPSession();
if (throttle > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: throttle });
await press(page, "TapStart", touch);
for (let i = 0; i < 8; i++) { const m = await marks(page); if (m.live.includes("TapArrivalNext")) await press(page, "TapArrivalNext", touch); }
await press(page, "TapCloseHost", touch); await press(page, "TapSkipWalkthrough", touch); await sleep(300);
const speeds = (process.env.SPEEDS || "400,700,1000,1400,1800,2300,2800,3400,4500").split(",").map(Number);
// dispatch with explicit timing via CDP so the gaps are what we say
// A minimum-jerk flick (Swift's flickprobe shape) of duration T over distance D, sampled at 120 Hz like an iPhone,
// with each event stamped at its sample time, released at speed (not ridden to a stop: the stroke keeps going past
// the release point as a real thumb leaves the glass).
async function mjFlick(T, dx) {
  const x = vp.width / 2, y0 = vp.height - 70, m = await marks(page), D = (y0 - (m.crease + 12)) * 1.25;
  const dt = 1 / 120, n = Math.round(T / dt), cut = Math.round(n * 0.8);
  const base = Date.now() / 1000 + 0.05;
  const pos = (i) => { const u = i / n; return 10 * u ** 3 - 15 * u ** 4 + 6 * u ** 5; };
  const send = (type, i, pts) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: pts, timestamp: base + i * dt });
  const wait = async (i) => { while (Date.now() / 1000 < base + i * dt) await new Promise((r) => setImmediate(r)); };
  await wait(0); await send("touchStart", 0, [{ x, y: y0 }]);
  let peak = 0;
  for (let i = 1; i <= cut; i++) { await wait(i); const p = pos(i); peak = Math.max(peak, (p - pos(i - 1)) * D / dt); await send("touchMove", i, [{ x: x + dx * p, y: y0 - D * p }]); }
  await wait(cut + 0.5); await send("touchEnd", cut + 0.5, []);
  const rel = (pos(cut) - pos(cut - 1)) * D / dt;
  return { n: cut, real: Math.round(0.5 * rel + 0.5 * peak) };
}
async function constFlick(speed, dx) {
  if (process.env.MJ) return mjFlick(speed / 1000, dx);
  const x = vp.width / 2, y0 = vp.height - 70, m = await marks(page), y1 = m.crease + 12, D = y0 - y1;
  const dt = 16, n = Math.max(4, Math.round(D / speed * 1000 / dt));
  const type = touch ? "Input.dispatchTouchEvent" : "Input.dispatchMouseEvent";
  const ev = (kind, px, py) => touch ? cdp.send(type, { type: kind, touchPoints: kind === "touchEnd" ? [] : [{ x: px, y: py }] }) : cdp.send(type, { type: kind, x: px, y: py, button: "left", buttons: kind === "mouseReleased" ? 0 : 1, clickCount: 1 });
  await ev(touch ? "touchStart" : "mousePressed", x, y0);
  const t0 = performance.now();
  for (let i = 1; i <= n; i++) { while (performance.now() - t0 < i * dt) await new Promise((r) => setImmediate(r)); await ev(touch ? "touchMove" : "mouseMoved", x + dx * i / n, y0 - D * i / n); }
  await ev(touch ? "touchEnd" : "mouseReleased", x + dx, y1);
  return { n, real: Math.round(D / ((performance.now() - t0) / 1000)) };
}
const res = [];
for (let k = 0; k < speeds.length; k++) {
  let m = await marks(page);
  for (let g = 0; g < 20 && !(m.canThrow === "1" && m.busy === "0" && m.layer === "LayerBase"); g++) {
    if (m.live.includes("TapGotIt")) await press(page, "TapGotIt", touch);
    else if (m.live.includes("TapPull") && m.busy === "0") { await press(page, "TapPull", touch); await waitFor(page, (m) => m.busy === "0", "reels", 15000); }
    else if (m.live.includes("TapLeaveCounter")) await press(page, "TapLeaveCounter", touch);
    else if (m.live.includes("TapNewRun")) await press(page, "TapNewRun", touch);
    else await sleep(200);
    m = await marks(page);
  }

  const before = (await text(page));
  await page.evaluate(() => { const f = window.__ft; f.cb = []; f.gap = []; f.last = 0; f.on = true; });
  const t0 = Date.now();
  const f = await constFlick(speeds[k], 0);
  await sleep(40); const thrown = (await marks(page)).canThrow === "0";
  // sample the toast as it appears
  let toast = "";
  const until = Date.now() + 25000;
  while (Date.now() < until) { const mm = await marks(page); const t = await text(page); const extra = t.replace(before, ""); if (/GUTTER|\+\d+|FOUL|HOT|TOP SLOT|SO CLOSE/.test(t) && !toast) toast = (t.match(/(GUTTER|FOUL\w*|\+\d+[^A-Z]*|HOT SPOT!?|TOP SLOT!?)/g) || []).join(" "); if (mm.busy === "0" && Date.now() - t0 > 500) break; await sleep(60); }
  const settle = Date.now() - t0;
  const fr = await page.evaluate(() => { const f = window.__ft; f.on = false; const g = f.gap.slice().sort((a, b) => a - b), c = f.cb.slice().sort((a, b) => a - b); const q = (a, p) => a.length ? +a[Math.min(a.length - 1, Math.floor(a.length * p))].toFixed(1) : null; return `gap p50 ${q(g, .5)} p95 ${q(g, .95)} max ${q(g, 1)} | cb p50 ${q(c, .5)} p95 ${q(c, .95)} max ${q(c, 1)} | >34ms ${g.filter((x) => x > 34).length}/${g.length}`; });
  const after = await text(page);
  const sc = (after.match(/(\d+) \/ (\d+)/) || [])[0];
  res.push(`speed ${speeds[k]} px/s (moves ${f.n}, real ${f.real}) thrown=${thrown} settle ${settle}ms result: ${toast || "-"} score ${sc} | ${fr}`);
  console.log(res[res.length - 1]);
  if (k < 3 || k === speeds.length - 1) await shot(page, `${which}-s${throttle}-${speeds[k]}`);
}
await b.close();
