// Frame cost over three throws and a pull at 390x844 dpr3, with CPU throttled 1x and 4x; plus parse/startup time.
import { launch, sleep, press, flick, marks, waitFor, PHONE, URL } from "./lib.mjs";
const b = await launch();
for (const rate of [1, 4]) {
  const page = await b.newPage();
  await page.evaluateOnNewDocument(() => {
    window.__ft = { cb: [], gap: [], last: 0, on: false };
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (f) => raf((t) => { const s = performance.now(); f(t); const d = performance.now() - s; const ft = window.__ft; if (ft.on) { ft.cb.push(d); if (ft.last) ft.gap.push(t - ft.last); } ft.last = t; });
  });
  await page.setViewport(PHONE);
  const cdp = await page.target().createCDPSession();
  await page.goto(URL, { waitUntil: "load" }); await page.evaluate(() => localStorage.clear());
  await cdp.send("Emulation.setCPUThrottlingRate", { rate });
  const t0 = Date.now(); await page.reload({ waitUntil: "load" });
  while (!(await page.evaluate(() => document.documentElement.getAttribute("data-layer")))) await sleep(5);
  const boot = Date.now() - t0;
  await sleep(500);
  await press(page, "TapStart", true);
  for (let i = 0; i < 8; i++) { const m = await marks(page); if (m.live.includes("TapArrivalNext")) await press(page, "TapArrivalNext", true); }
  await press(page, "TapCloseHost", true); await press(page, "TapSkipWalkthrough", true); await sleep(300);
  const stat = async (label) => { const r = await page.evaluate(() => { const f = window.__ft; f.on = false; const g = f.gap.slice().sort((a, b) => a - b), c = f.cb.slice().sort((a, b) => a - b); const q = (a, p) => a.length ? +a[Math.min(a.length - 1, Math.floor(a.length * p))].toFixed(2) : null; return { n: g.length, gapP50: q(g, .5), gapP95: q(g, .95), gapMax: q(g, 1), cbP50: q(c, .5), cbP95: q(c, .95), cbMax: q(c, 1), over20: g.filter((x) => x > 20).length }; }); console.log(`rate ${rate}x ${label}: ${JSON.stringify(r)}`); };
  const on = () => page.evaluate(() => { const f = window.__ft; f.cb = []; f.gap = []; f.last = 0; f.on = true; });
  await on(); await press(page, "TapPull", true); await waitFor(page, (m) => m.busy === "0", "reels", 20000); await stat("pull");
  for (let k = 0; k < 3; k++) { const m = await marks(page); if (m.canThrow !== "1") { await sleep(300); continue; }
    await on(); await flick(page, true, 195, 784, 195 + (k - 1) * 30, m.crease + 15, 8, 16); await sleep(100); await waitFor(page, (m) => m.busy === "0", "settle", 30000); await stat("throw " + (k + 1)); }
  const heap = await page.evaluate(() => performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1e6) : null);
  console.log(`rate ${rate}x boot-to-first-mark ${boot} ms, JS heap ${heap} MB`);
  await page.close();
}
await b.close();
