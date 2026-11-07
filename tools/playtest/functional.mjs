// Round-1 functional playtest: plays like a person through the whole loop.
//   node tools/playtest/functional.mjs [url] [phone|desktop] [scenario]
// scenarios: walk (walkthrough to the counter + buy), run (real run, reload
// mid-run, play to loss), all (default).
import puppeteer from "puppeteer-core";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const shots = join(here, "shots", "func");
mkdirSync(shots, { recursive: true });
const url = process.argv[2] || "http://127.0.0.1:8161/";
const which = process.argv[3] || "phone";
const scenario = process.argv[4] || "all";
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(...a);
const notes = [];
const note = (s) => { notes.push(s); log("NOTE " + s); };

const vp = which === "phone"
  ? { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
  : { width: 1280, height: 800, deviceScaleFactor: 1 };
const touch = which === "phone";
let shotN = 0;
async function shot(page, what) {
  const p = join(shots, `${which}-${String(++shotN).padStart(3, "0")}-${what}.png`);
  await page.screenshot({ path: p });
  return p;
}

async function marks(page) {
  return page.evaluate(() => {
    const el = document.documentElement;
    return {
      layer: el.getAttribute("data-layer"),
      canThrow: el.getAttribute("data-can-throw"),
      busy: el.getAttribute("data-busy"),
      crease: Number(el.getAttribute("data-crease-y")),
      live: [...document.querySelectorAll("#hud [data-intent]")].map((b) => b.dataset.intent),
      text: document.getElementById("hud").innerText.replace(/\s+/g, " "),
    };
  });
}
async function waitFor(page, pred, what, ms = 15000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const m = await marks(page);
    if (pred(m)) return m;
    await sleep(60);
  }
  const m = await marks(page);
  note(`timed out waiting for ${what}: layer=${m.layer} can=${m.canThrow} busy=${m.busy} live=${JSON.stringify(m.live)} text=${m.text.slice(0, 200)}`);
  await shot(page, "timeout");
  return null;
}
async function press(page, intent) {
  const sel = `#hud [data-intent="${intent}"]`;
  await page.waitForSelector(sel, { timeout: 6000 });
  if (touch) await page.tap(sel); else await page.click(sel);
  await sleep(180);
}

// A thumb flick: from y0 near the bottom up `len` px, `dx` sideways, over
// `steps` moves `gap` ms apart; ends `stopShort` px below the crease.
async function flick(page, { y0, y1, dx = 0, steps = 8, gap = 14, xoff = 0 }) {
  const x = vp.width / 2 + xoff;
  const pts = [];
  for (let i = 0; i <= steps; i++) pts.push([x + dx * (i / steps), y0 + (y1 - y0) * (i / steps)]);
  if (touch) {
    await page.touchscreen.touchStart(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) { await sleep(gap); await page.touchscreen.touchMove(pts[i][0], pts[i][1]); }
    await page.touchscreen.touchEnd();
  } else {
    await page.mouse.move(pts[0][0], pts[0][1]);
    await page.mouse.down();
    for (let i = 1; i < pts.length; i++) { await sleep(gap); await page.mouse.move(pts[i][0], pts[i][1]); }
    await page.mouse.up();
  }
}

const styles = [
  { name: "medium-straight", f: (c) => ({ y0: vp.height - 60, y1: c + 20, steps: 8, gap: 16 }) },
  { name: "hard-straight", f: (c) => ({ y0: vp.height - 40, y1: c + 10, steps: 5, gap: 10 }) },
  { name: "soft-short", f: (c) => ({ y0: vp.height - 60, y1: vp.height - 160, steps: 8, gap: 25 }) },
  { name: "angle-left", f: (c) => ({ y0: vp.height - 60, y1: c + 15, dx: -40, steps: 7, gap: 14 }) },
  { name: "angle-right", f: (c) => ({ y0: vp.height - 60, y1: c + 15, dx: 45, steps: 7, gap: 14 }) },
  { name: "slow-drag", f: (c) => ({ y0: vp.height - 50, y1: c + 30, steps: 20, gap: 30 }) },
  { name: "fast-left-lane", f: (c) => ({ y0: vp.height - 50, y1: c + 10, xoff: -60, dx: 20, steps: 5, gap: 10 }) },
  { name: "foul-past-crease", f: (c) => ({ y0: vp.height - 60, y1: c - 60, steps: 8, gap: 14 }) },
  { name: "medium-right-lane", f: (c) => ({ y0: vp.height - 60, y1: c + 20, xoff: 55, dx: -15, steps: 8, gap: 15 }) },
];

const hudLine = (t) => t.slice(0, 260);
let throwN = 0;
async function throwBall(page, m, style) {
  const s = style || styles[throwN % styles.length];
  throwN++;
  const before = m.text;
  await flick(page, s.f(m.crease));
  await sleep(100);
  const after = await marks(page);
  const thrown = after.canThrow === "0";
  log(`throw #${throwN} ${s.name}: thrown=${thrown}`);
  if (!thrown && s.name !== "foul-past-crease") note(`flick ${s.name} did not throw (crease ${m.crease})`);
  if (throwN <= 3) { await sleep(500); await shot(page, `roll-${s.name}`); }
  const settled = await waitFor(page, (m) => m.busy === "0", "settle", 25000);
  if (settled) log("   after: " + hudLine(settled.text));
  return { thrown, before, after: settled };
}

async function newPage(browser) {
  const page = await browser.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errors.push(`${m.type()}: ${m.text()}`); });
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("response", (r) => { if (r.status() >= 400) errors.push(`http ${r.status()}: ${r.url()}`); });
  await page.setViewport(vp);
  return { page, errors };
}

// One decision per call: whatever a person would do next.
async function step(page, opts = {}) {
  const m = await marks(page);
  const live = m.live;
  if (m.layer === "LayerArrival") { await press(page, "TapArrivalNext"); return "arrival"; }
  if (m.layer === "LayerHost") { await press(page, "TapCloseHost"); return "host"; }
  if (m.layer === "LayerConfirmNew") { await press(page, opts.confirmNew ? "TapNewRun" : "TapKeepPlaying"); return "confirm"; }
  if (live.includes("TapGotIt")) { log("coach: " + hudLine(m.text)); await shot(page, "coach"); await press(page, "TapGotIt"); return "gotit"; }
  if (m.busy === "1") { await sleep(100); return "busy"; }
  if (live.includes("TapLeaveCounter")) return "counter";
  if (m.canThrow === "1") { await throwBall(page, m, opts.style ? opts.style() : undefined); return "throw"; }
  if (live.includes("TapPull")) { log("pull: " + hudLine(m.text)); await press(page, "TapPull"); await waitFor(page, (m) => m.busy === "0", "pull to settle"); return "pull"; }
  if (live.includes("TapStart")) return "title";
  await sleep(150);
  return "idle";
}

async function load(page) {
  const t0 = Date.now();
  await page.goto(url, { waitUntil: "load" });
  const tLoad = Date.now() - t0;
  await waitFor(page, (m) => m.layer !== null, "first frame", 20000);
  const tFirst = Date.now() - t0;
  await page.evaluate(() => document.fonts.ready);
  return { tLoad, tFirst };
}

async function measureThrowFrames(page) {
  return page.evaluate(() => new Promise((res) => {
    const ts = []; const t0 = performance.now();
    const f = (t) => { ts.push(t); if (t - t0 < 3000) requestAnimationFrame(f); else res(ts); };
    requestAnimationFrame(f);
  }));
}

async function walk(browser) {
  log(`=== walkthrough (${which})`);
  const { page, errors } = await newPage(browser);
  await page.goto(url, { waitUntil: "load" });
  await page.evaluate(() => localStorage.clear());
  const t = await load(page);
  log(`load: ${JSON.stringify(t)}`);
  await sleep(500);
  await shot(page, "title");
  await press(page, "TapStart");
  let counter = false;
  for (let i = 0; i < 200; i++) {
    const r = await step(page);
    if (r === "counter") { counter = true; break; }
    if (r === "title") { note("walkthrough returned to the title"); break; }
  }
  if (!counter) note("walkthrough never reached the prize counter");
  let m = await marks(page);
  log("counter: " + m.text);
  log("counter live: " + JSON.stringify(m.live));
  await shot(page, "counter");
  // Buy the first affordable offer.
  const buys = m.live.filter((x) => x.startsWith("TapBuyOffer"));
  const sels = m.live.filter((x) => x.startsWith("TapSelectOffer"));
  log("buys " + JSON.stringify(buys) + " sels " + JSON.stringify(sels));
  if (sels.length) { await press(page, sels[0]); m = await marks(page); log("selected: " + JSON.stringify(m.live)); await shot(page, "counter-selected"); }
  const buys2 = m.live.filter((x) => x.startsWith("TapBuyOffer"));
  if (buys2.length) {
    const before = m.text;
    await press(page, buys2[0]);
    await sleep(500);
    m = await marks(page);
    log("after buy: " + m.text);
    await shot(page, "bought");
    if (m.text === before) note("buying an offer changed nothing on screen");
  } else note("no buy button at the counter");
  for (let i = 0; i < 5 && (await marks(page)).live.includes("TapGotIt"); i++) { await shot(page, "card"); await press(page, "TapGotIt"); }
  m = await marks(page);
  if (m.live.includes("TapLeaveCounter")) await press(page, "TapLeaveCounter");
  await sleep(800);
  for (let i = 0; i < 6; i++) { const r = await step(page); if (r === "throw" || r === "pull") break; }
  m = await marks(page);
  log("after counter: " + m.text);
  await shot(page, "after-walkthrough");
  const store = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k).slice(0, 300)])));
  log("storage: " + JSON.stringify(store, null, 1));
  await page.close();
  return errors;
}

async function run(browser) {
  log(`=== real run (${which})`);
  const { page, errors } = await newPage(browser);
  await page.goto(url, { waitUntil: "load" });
  // Already-done walkthrough: mark seen keys by skipping.
  await page.evaluate(() => localStorage.clear());
  await load(page);
  await press(page, "TapStart");
  for (let i = 0; i < 10; i++) {
    const m = await marks(page);
    if (m.layer === "LayerArrival") await press(page, "TapArrivalNext");
    else if (m.layer === "LayerHost") await press(page, "TapCloseHost");
    else if (m.live.includes("TapSkipWalkthrough")) { await press(page, "TapSkipWalkthrough"); break; }
    else await sleep(200);
  }
  await waitFor(page, (m) => m.live.includes("TapPull") && m.busy === "0", "machine after skip");
  let m = await marks(page);
  log("run start: " + m.text);
  await shot(page, "run-start");

  // Frame timings over one throw.
  for (let i = 0; i < 10; i++) { const r = await step(page); if (r === "pull") break; }
  m = await waitFor(page, (m) => m.canThrow === "1", "throw ready");
  const fp = measureThrowFrames(page);
  await sleep(30);
  await flick(page, styles[0].f(m.crease));
  const ts = await fp;
  const d = ts.slice(1).map((t, i) => t - ts[i]);
  d.sort((a, b) => a - b);
  const pct = (p) => d[Math.min(d.length - 1, Math.floor(p * d.length))].toFixed(1);
  const perf = `frames over 3 s throw: n=${d.length} median=${pct(0.5)}ms p95=${pct(0.95)}ms p99=${pct(0.99)}ms max=${d[d.length - 1].toFixed(1)}ms`;
  log(perf);
  await waitFor(page, (m) => m.busy === "0", "settle");

  // Play 4 more balls, then reload mid-frame and compare.
  let throws = 0;
  for (let i = 0; i < 60 && throws < 4; i++) { const r = await step(page); if (r === "throw") throws++; }
  m = await waitFor(page, (m) => m.busy === "0", "settle before reload");
  const beforeText = m.text;
  await shot(page, "before-reload");
  const saved = await page.evaluate(() => localStorage.getItem("skee.run"));
  log("saved run length " + (saved ? saved.length : null));
  await page.reload({ waitUntil: "load" });
  await waitFor(page, (m) => m.layer !== null, "reload first frame");
  await sleep(1200);
  m = await marks(page);
  await shot(page, "after-reload");
  log("before reload: " + beforeText);
  log("after reload : " + m.text);
  if (m.live.includes("TapStart")) {
    log("reload landed on the title; tapping play");
    await press(page, "TapStart");
    await sleep(800);
    m = await marks(page);
    log("after tap play: " + m.text);
    await shot(page, "after-reload-play");
  }

  // Play to a loss: soft throws only (gutter-ish), counting frames and rounds.
  const soft = () => styles[2];
  let lost = false;
  let n = 0;
  for (let i = 0; i < 400; i++) {
    const mm = await marks(page);
    if (/GAME OVER|NOT TO WORRY/i.test(mm.text) && !lost) { lost = true; log("LOSS: " + mm.text); await shot(page, "game-over"); }
    if (lost && mm.live.includes("TapNewRun")) break;
    if (mm.live.includes("TapLeaveCounter")) { log("counter: " + hudLine(mm.text)); await shot(page, "run-counter"); await press(page, "TapLeaveCounter"); continue; }
    const r = await step(page, { style: soft });
    if (r === "throw") n++;
    if (r === "title") break;
  }
  m = await marks(page);
  log(`after loss loop (balls ${n}): layer=${m.layer} live=${JSON.stringify(m.live)} text=${m.text}`);
  await shot(page, "end");
  const store = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k).slice(0, 400)])));
  log("storage: " + JSON.stringify(store, null, 1));
  if (m.live.includes("TapNewRun")) {
    await press(page, "TapNewRun");
    await sleep(800);
    m = await marks(page);
    log("after new run: " + m.text);
    await shot(page, "new-run");
  }
  await page.close();
  return { errors, perf };
}

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });
const out = { notes };
try {
  if (scenario === "walk" || scenario === "all") out.walkErrors = await walk(browser);
  if (scenario === "run" || scenario === "all") { const r = await run(browser); out.runErrors = r.errors; out.perf = r.perf; }
} catch (e) {
  note("EXCEPTION " + e.stack);
} finally {
  await browser.close();
}
log(JSON.stringify(out, null, 1));
writeFileSync(join(shots, `${which}-${scenario}-result.json`), JSON.stringify(out, null, 1));
