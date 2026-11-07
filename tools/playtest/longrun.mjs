// A long real run with realistic flicks: round transitions, counters, boss, end.
// Also wraps requestAnimationFrame to time each frame's work (JS + canvas).
import { launch, open, sleep, PHONE, DESK } from "./lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8161/";
const vp = process.argv[3] === "desktop" ? DESK : PHONE;
const maxThrows = +(process.argv[4] || 150);
const dir = new URL("./shots/func2/", import.meta.url).pathname;
const b = await launch();
const page0 = await b.newPage();
await page0.evaluateOnNewDocument(() => {
  const raf = window.requestAnimationFrame.bind(window);
  window.__work = [];
  window.requestAnimationFrame = (cb) => raf((t) => { const s = performance.now(); cb(t); window.__work.push(performance.now() - s); if (window.__work.length > 20000) window.__work.splice(0, 10000); });
});
await page0.close();
const g = await open(b, url, vp, { "skee.arrivalDone": "true", "skee.walkthroughDone": "true" });
// evaluateOnNewDocument must be on the same page: redo on g.page
await g.page.evaluateOnNewDocument(() => {
  const raf = window.requestAnimationFrame.bind(window);
  window.__work = [];
  window.requestAnimationFrame = (cb) => raf((t) => { const s = performance.now(); cb(t); window.__work.push(performance.now() - s); });
});
await g.page.reload(); await g.page.waitForFunction(() => document.documentElement.getAttribute("data-layer")); await sleep(500);
await g.press("TapStart");
let thrown = 0, lastRound = "", rounds = [], shotsTaken = 0;
const pct = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
let throwWork = [];
for (let i = 0; i < 3000 && thrown < maxThrows; i++) {
  const m = await g.marks();
  const r = m.text.match(/ANTE (\d)\/8 ([A-Z -]+?) (\d+) \/ (\d+) (\d+)/);
  if (r) { const k = `${r[1]} ${r[2]}`; if (k !== lastRound) { lastRound = k; rounds.push(`${k} target ${r[4]} tickets ${r[5]}`); console.log("ROUND " + rounds[rounds.length - 1] + " | " + m.text.slice(0, 160)); if (/BOSS/.test(k)) await g.shot(dir + `long-boss-${r[1]}.png`); } }
  if (m.live.includes("TapGotIt")) { console.log("  card " + (m.text.match(/([A-Z][A-Z !',.?]{4,}) SKIP/)?.[1])); await g.press("TapGotIt"); continue; }
  if (m.live.includes("TapLeaveCounter")) {
    console.log("COUNTER " + m.text.match(/PRIZE COUNTER.*?NEXT ROUND/)?.[0]);
    if (shotsTaken++ < 2) await g.shot(dir + `long-counter-${shotsTaken}.png`);
    // Buy something affordable that needs no target.
    const tix = +(m.text.match(/PRIZE COUNTER (\d+)/)?.[1] || 0);
    const buy = m.live.find((x) => x.startsWith("TapBuyOffer"));
    if (buy) { await g.press(buy); const m2 = await g.marks(); console.log(`  ${buy}: tickets ${tix} -> ${m2.text.match(/PRIZE COUNTER (\d+)/)?.[1]}`); }
    for (let k = 0; k < 3; k++) { const mm = await g.marks(); if (mm.live.includes("TapGotIt")) { console.log("  card " + (mm.text.match(/([A-Z][A-Z !',.?]{4,}) SKIP/)?.[1])); await g.press("TapGotIt"); } }
    await g.press("TapLeaveCounter"); continue;
  }
  if (m.live.includes("TapNewRun") && /GAME OVER|YOU WIN|WON/.test(m.text)) { console.log("END " + m.text.slice(0, 400)); await g.shot(dir + "long-end.png"); break; }
  if (m.busy === "1") { await sleep(80); continue; }
  if (m.can === "1") {
    await g.page.evaluate(() => { window.__work = []; });
    await g.flick({ gap: [13, 14, 12, 15][thrown % 4], xoff: [0, -15, 15, -30, 30, 0][thrown % 6] });
    thrown++;
    await sleep(100); await g.settle();
    throwWork.push(...await g.page.evaluate(() => window.__work));
    continue;
  }
  if (m.live.includes("TapPull")) { await g.press("TapPull"); continue; }
  await sleep(100);
}
const m = await g.marks();
console.log("final: " + m.text.slice(0, 300));
console.log(`thrown ${thrown}; rounds: ${JSON.stringify(rounds)}`);
console.log(`frame work over throws: n=${throwWork.length} median=${pct(throwWork, .5).toFixed(2)}ms p95=${pct(throwWork, .95).toFixed(2)}ms p99=${pct(throwWork, .99).toFixed(2)}ms max=${Math.max(...throwWork).toFixed(2)}ms`);
console.log("errors " + JSON.stringify(g.errors));
await b.close();
