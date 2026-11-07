// Frame intervals and per-frame work over a throw (phone dpr3 and desktop), with and without 4x CPU throttle.
import { launch, open, PHONE, DESK, sleep } from "../lib.mjs";
const url = "http://127.0.0.1:8161/";
const pct = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
const fmt = (a) => `n=${a.length} med=${pct(a, .5).toFixed(2)} p95=${pct(a, .95).toFixed(2)} p99=${pct(a, .99).toFixed(2)} max=${Math.max(...a).toFixed(2)}`;
const b = await launch();
for (const [name, vp, thr] of [["phone", PHONE, 1], ["phone-4xCPU", PHONE, 4], ["desktop", DESK, 1]]) {
  const g = await open(b, url, vp, { "skee.arrivalDone": "true", "skee.walkthroughDone": "true" });
  await g.page.evaluateOnNewDocument(() => { const raf = window.requestAnimationFrame.bind(window); window.__work = []; window.__iv = []; let last = 0; window.requestAnimationFrame = (cb) => raf((t) => { if (last) window.__iv.push(t - last); last = t; const s = performance.now(); cb(t); window.__work.push(performance.now() - s); }); });
  await g.page.reload(); await g.page.waitForFunction(() => document.documentElement.getAttribute("data-layer")); await sleep(600);
  if (thr > 1) await g.cdp.send("Emulation.setCPUThrottlingRate", { rate: thr });
  await g.press("TapStart"); for (let k = 0; k < 3; k++) { const m = await g.marks(); if (m.live.includes("TapGotIt")) await g.press("TapGotIt"); }
  await g.page.evaluate(() => { window.__work = []; window.__iv = []; }); await sleep(2000);
  const idle = await g.page.evaluate(() => ({ w: window.__work, i: window.__iv }));
  await g.press("TapPull");
  await g.page.evaluate(() => { window.__work = []; window.__iv = []; });
  for (let i = 0; i < 100; i++) { const m = await g.marks(); if (m.can === "1" && m.busy === "0") break; await sleep(80); }
  const spin = await g.page.evaluate(() => ({ w: window.__work, i: window.__iv }));
  const W = [], I = [];
  for (let k = 0; k < 3; k++) {
    for (let i = 0; i < 100; i++) { const m = await g.marks(); if (m.can === "1" && m.busy === "0") break; if (m.live.includes("TapGotIt")) await g.press("TapGotIt"); await sleep(80); }
    await g.page.evaluate(() => { window.__work = []; window.__iv = []; });
    await g.flick({ gap: 13 }); await sleep(100); await g.settle();
    const r = await g.page.evaluate(() => ({ w: window.__work, i: window.__iv })); W.push(...r.w); I.push(...r.i);
  }
  console.log(`${name}: title->game idle work ${fmt(idle.w)} | interval ${fmt(idle.i)}`);
  console.log(`${name}: spin work ${fmt(spin.w)} | interval ${fmt(spin.i)}`);
  console.log(`${name}: throws work ${fmt(W)} | interval ${fmt(I)} | frames>20ms ${I.filter((x) => x > 20).length} >34ms ${I.filter((x) => x > 34).length}`);
  const heap = await g.page.evaluate(() => (performance.memory.usedJSHeapSize / 1e6).toFixed(1)); console.log(`${name}: heap ${heap}MB errors ${g.errors.length}`);
  await g.page.close();
}
await b.close();
