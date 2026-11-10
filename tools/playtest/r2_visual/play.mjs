// A whole run as a person: first launch (walkthrough skipped), pulls, flicks at
// different strengths and angles, the counter (buy), the guide, a reload
// mid-run, and on until the run ends. Frame callback timing over every throw.
import { launch, shot, marks, text, sleep, press, flick, waitFor, PHONE, DESK, URL } from "./lib.mjs";
const which = process.argv[2] || "phone";
const tag = which + (process.env.WALK ? "W" : "");
const vp = which === "phone" ? PHONE : DESK, touch = which === "phone";
const b = await launch();
const page = await b.newPage();
const log = [];
page.on("console", (m) => log.push(`${m.type()}: ${m.text()}`));
page.on("pageerror", (e) => log.push("pageerror: " + e.message));
await page.evaluateOnNewDocument(() => {
  window.__ft = { cb: [], gap: [], last: 0, on: false };
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (f) => raf((t) => {
    const s = performance.now(); f(t); const d = performance.now() - s;
    const ft = window.__ft; if (ft.on) { ft.cb.push(d); if (ft.last) ft.gap.push(t - ft.last); } ft.last = t;
  });
});
await page.setViewport(vp);
await page.goto(URL, { waitUntil: "load" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "load" });
await page.evaluate(() => document.fonts.ready); await sleep(600);
let n = 0;
const S = async (what) => { n++; return shot(page, `${tag}-p${String(n).padStart(3, "0")}-${what}`); };
const hud = async () => (await text(page)).replace(/^BAR 7 /, "");
await press(page, "TapStart", touch);
for (let i = 0; i < 8; i++) { const m = await marks(page); if (m.live.includes("TapArrivalNext")) await press(page, "TapArrivalNext", touch); }
await press(page, "TapCloseHost", touch);
if (!process.env.WALK) await press(page, "TapSkipWalkthrough", touch);
await sleep(400);
// flick styles: [name, dx at top, steps, gap ms, start y offset from bottom, end above crease]
const styles = [
  ["medium-straight", 0, 8, 16, 60, 15], ["hard-straight", 0, 5, 10, 60, 10], ["soft", 0, 10, 35, 60, 120],
  ["left-angle", -70, 8, 14, 60, 15], ["right-angle", 70, 8, 14, 60, 15], ["very-hard", 10, 3, 8, 40, 5], ["feeble", 0, 6, 60, 60, 250],
];
let throwNo = 0, reloaded = false, guided = false, bought = false;
const summary = [];
const perf = [];
for (let iter = 0; iter < 140; iter++) {
  const m = await marks(page);
  const t = await hud();
  if (m.layer === "LayerBase" && m.live.some((x) => x.startsWith("TapBuyOffer") || x === "TapLeaveCounter")) {
    await S("counter"); console.log("COUNTER: " + t.slice(0, 400));
    const buy = m.live.find((x) => x.startsWith("TapBuyOffer"));
    if (buy && !bought) {
      // read the offer card under it for its price, buy, see the tickets change
      await press(page, buy, touch); await sleep(500); await S("counter-bought");
      console.log("BOUGHT " + buy + " -> " + JSON.stringify((await marks(page)).live) + " | " + (await hud()).slice(0, 200));
      bought = true;
      const m2 = await marks(page);
      if (m2.live.includes("TapSelectOffer(None)") || m2.layer !== "LayerBase") { await S("counter-after-buy"); }
    }
    const m3 = await marks(page);
    if (m3.live.includes("TapLeaveCounter")) { await press(page, "TapLeaveCounter", touch); await sleep(600); await S("after-counter"); }
    else { console.log("no leave? " + JSON.stringify(m3)); await sleep(500); }
    continue;
  }
  if (m.live.includes("TapGotIt")) { await press(page, "TapGotIt", touch); continue; }
  if (m.live.includes("TapCloseHost")) { await press(page, "TapCloseHost", touch); continue; }
  if (m.layer !== "LayerBase") {
    await S("layer-" + m.layer); console.log("LAYER " + m.layer + " live=" + m.live.join(",") + " | " + t.slice(0, 400));
    if (m.live.includes("TapStart") || /GAME OVER|RUN OVER|BUSTED/i.test(t)) break;
    const next = m.live.find((x) => !/Skip|Close/.test(x)) || m.live[0];
    if (!next) { await sleep(500); continue; }
    await press(page, next, touch); await sleep(400); continue;
  }
  if (m.live.includes("TapStart")) { await S("back-on-title"); console.log("TITLE again: " + t.slice(0, 300)); break; }
  if (m.live.includes("TapPull") && m.busy === "0") {
    if (!guided && throwNo >= 4 && m.live.includes("TapOpenGuide")) {
      guided = true; await press(page, "TapOpenGuide", touch); await sleep(300); await S("guide");
      console.log("GUIDE: " + (await hud()).slice(-300));
      await press(page, "Topic(1)", touch); await S("guide-topic1"); await press(page, "PageBack", touch); await press(page, "TapCloseGuide", touch);
    }
    if (!reloaded && throwNo >= 6) {
      const before = await hud();
      reloaded = true; await page.reload({ waitUntil: "load" }); await page.evaluate(() => document.fonts.ready); await sleep(900);
      const after = await hud(); await S("after-reload");
      console.log("RELOAD before: " + before.slice(0, 120) + "\n       after:  " + after.slice(0, 120) + "\n       marks: " + JSON.stringify(await marks(page)));
      continue;
    }
    const t0 = Date.now();
    await press(page, "TapPull", touch);
    await sleep(150); await S("reels-spinning");
    await waitFor(page, (m) => m.busy === "0", "reels", 15000);
    console.log(`pull took ${Date.now() - t0} ms`);
    continue;
  }
  if (m.canThrow === "1" && m.busy === "0") {
    const [name, dx, steps, gap, yb, above] = styles[throwNo % styles.length];
    throwNo++;
    const x = vp.width / 2, y0 = vp.height - yb;
    const before = await hud();
    await page.evaluate(() => { window.__ft.cb = []; window.__ft.gap = []; window.__ft.last = 0; window.__ft.on = true; window.__skeeAudio && (window.__skeeAudio.mark = window.__skeeAudio.log.length); });
    const t0 = Date.now();
    await flick(page, touch, x, y0, x + dx, m.crease + above, steps, gap);
    await sleep(30);
    const thrown = (await marks(page)).canThrow === "0";
    if (throwNo <= 8 || throwNo % 5 === 0) { await sleep(250); await S(`throw${throwNo}-${name}-a`); await sleep(400); await S(`throw${throwNo}-${name}-b`); }
    await waitFor(page, (m) => m.busy === "0", "settle", 25000);
    const dt = Date.now() - t0;
    const fr = await page.evaluate(() => { const f = window.__ft; f.on = false; const g = f.gap.slice().sort((a, b) => a - b), c = f.cb.slice().sort((a, b) => a - b);
      const q = (a, p) => a.length ? +a[Math.min(a.length - 1, Math.floor(a.length * p))].toFixed(2) : null;
      const au = window.__skeeAudio ? window.__skeeAudio.log.slice(window.__skeeAudio.mark || 0).map((e) => (e.cmds || e.commands || e.desc || JSON.stringify(e)).toString().slice(0, 80)) : [];
      return { frames: g.length, gapP50: q(g, .5), gapP95: q(g, .95), gapMax: q(g, 1), cbP50: q(c, .5), cbP95: q(c, .95), cbMax: q(c, 1), long: g.filter((x) => x > 34).length, audio: au }; });
    perf.push(fr);
    if (throwNo <= 8 || throwNo % 5 === 0) await S(`throw${throwNo}-${name}-settled`);
    const after = await hud();
    summary.push(`${throwNo} ${name} thrown=${thrown} ${dt}ms  ${after.slice(0, 90)}`);
    console.log(`THROW ${throwNo} ${name} thrown=${thrown} settle ${dt} ms frames ${JSON.stringify({ ...fr, audio: fr.audio.length })}\n   audio: ${fr.audio.slice(0, 12).join(" | ")}\n   hud: ${after.slice(0, 200)}`);
    continue;
  }
  await sleep(200);
}
await S("end");
console.log("END marks " + JSON.stringify(await marks(page)) + "\n" + (await hud()).slice(0, 500));
console.log(summary.join("\n"));
const all = perf.filter((p) => p.frames);
console.log("PERF over throws: gap p50 max " + Math.max(...all.map((p) => p.gapP50)) + " gap p95 max " + Math.max(...all.map((p) => p.gapP95)) + " cb p95 max " + Math.max(...all.map((p) => p.cbP95)) + " cb max " + Math.max(...all.map((p) => p.cbMax)) + " long frames total " + all.reduce((a, p) => a + p.long, 0) + " of " + all.reduce((a, p) => a + p.frames, 0));
console.log("CONSOLE:\n" + log.filter((l) => !/^(log|debug|info)/.test(l)).join("\n"));
await b.close();
