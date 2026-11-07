// Round-1 functional playtest, part 2: board edit, lever drag, foul, prize
// shop purchase + persistence, reload mid-roll and at the counter, guide
// mid-run, desktop mouse.
//   node tools/playtest/functional2.mjs [url] [phone|desktop]
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const shots = join(here, "shots", "func2");
mkdirSync(shots, { recursive: true });
const url = process.argv[2] || "http://127.0.0.1:8161/";
const which = process.argv[3] || "phone";
const only = process.argv[4] || "";
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(...a);
const vp = which === "phone"
  ? { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
  : { width: 1280, height: 800, deviceScaleFactor: 1 };
const touch = which === "phone";
let shotN = 0;
async function shot(page, what) {
  const p = join(shots, `${which}-${String(++shotN).padStart(3, "0")}-${what}.png`);
  await page.screenshot({ path: p });
  log("  shot " + p);
}
async function marks(page) {
  return page.evaluate(() => {
    const el = document.documentElement;
    return {
      layer: el.getAttribute("data-layer"), canThrow: el.getAttribute("data-can-throw"), busy: el.getAttribute("data-busy"),
      crease: Number(el.getAttribute("data-crease-y")),
      live: [...document.querySelectorAll("#hud [data-intent]")].map((b) => b.dataset.intent),
      text: document.getElementById("hud").innerText.replace(/\s+/g, " "),
    };
  });
}
async function waitFor(page, pred, what, ms = 15000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { const m = await marks(page); if (pred(m)) return m; await sleep(60); }
  const m = await marks(page);
  log(`TIMEOUT ${what}: ${JSON.stringify({ ...m, text: m.text.slice(0, 200) })}`);
  await shot(page, "timeout");
  return null;
}
async function press(page, intent) {
  const sel = `#hud [data-intent="${intent}"]`;
  await page.waitForSelector(sel, { timeout: 6000 });
  if (touch) await page.tap(sel); else await page.click(sel);
  await sleep(180);
}
async function tapAt(page, x, y) {
  if (touch) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y);
  await sleep(200);
}
async function drag(page, pts, gap = 16) {
  if (touch) {
    await page.touchscreen.touchStart(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) { await sleep(gap); await page.touchscreen.touchMove(pts[i][0], pts[i][1]); }
    await page.touchscreen.touchEnd();
  } else {
    await page.mouse.move(pts[0][0], pts[0][1]); await page.mouse.down();
    for (let i = 1; i < pts.length; i++) { await sleep(gap); await page.mouse.move(pts[i][0], pts[i][1]); }
    await page.mouse.up();
  }
}
function line(x0, y0, x1, y1, n) { const p = []; for (let i = 0; i <= n; i++) p.push([x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n]); return p; }
const flickPts = (c, o = {}) => line(vp.width / 2 + (o.xoff || 0), vp.height - 60, vp.width / 2 + (o.xoff || 0) + (o.dx || 0), o.y1 ?? c + 20, o.steps || 8);

async function newPage(browser) {
  const page = await browser.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errors.push(`${m.type()}: ${m.text()}`); });
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  await page.setViewport(vp);
  return { page, errors };
}
async function fresh(page, store = {}) {
  await page.goto(url, { waitUntil: "load" });
  await page.evaluate((s) => { localStorage.clear(); for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); }, store);
  await page.reload({ waitUntil: "load" });
  await waitFor(page, (m) => m.layer !== null, "boot");
  await page.evaluate(() => document.fonts.ready);
  await sleep(400);
}
const done = { "skee.arrivalDone": "true", "skee.walkthroughDone": "true" };
async function settle(page) { return waitFor(page, (m) => m.busy === "0", "settle", 25000); }
async function dismissCards(page) {
  for (let i = 0; i < 6; i++) { const m = await marks(page); if (m.live.includes("TapGotIt")) { log("  card: " + m.text.match(/[A-Z][A-Z !',.?]{6,}(?= SKIP)/)?.[0]); await press(page, "TapGotIt"); } else break; }
}
async function throwOne(page, o) {
  const m = await waitFor(page, (m) => m.canThrow === "1" && m.busy === "0", "can throw");
  if (!m) return null;
  await drag(page, flickPts(m.crease, o), o?.gap || 14);
  await sleep(120);
  const a = await marks(page);
  await settle(page);
  await dismissCards(page);
  return a.canThrow === "0";
}

const tests = {};

// The lever: drag the knob down past halfway and let go (Swift's Lever).
tests.lever = async (browser) => {
  const { page, errors } = await newPage(browser);
  await fresh(page, done);
  await press(page, "TapStart");
  await waitFor(page, (m) => m.live.includes("TapPull"), "machine");
  const r = await page.evaluate(() => { const b = document.querySelector('#hud .lever [data-intent]'); const t = document.querySelector('#hud .lever-track'); const rb = b.getBoundingClientRect(); const rt = t.getBoundingClientRect(); return { b: [rb.x + rb.width / 2, rb.y + rb.height / 2], t: [rt.y, rt.bottom] }; });
  log("lever knob/track " + JSON.stringify(r));
  await drag(page, line(r.b[0], r.b[1], r.b[0], r.t[1] - 5, 10), 20);
  await sleep(300);
  let m = await marks(page);
  const pulled = !m.live.includes("TapPull") || m.busy === "1";
  log(`lever drag pulled: ${pulled} busy=${m.busy}`);
  await shot(page, "lever-drag");
  await page.close();
  return errors;
};

// A foul: thumb dragged well past the crease (foulGive 140 pt in Stroke.swift).
tests.foul = async (browser) => {
  const { page, errors } = await newPage(browser);
  await fresh(page, done);
  await press(page, "TapStart");
  await press(page, "TapPull");
  const m = await waitFor(page, (m) => m.canThrow === "1" && m.busy === "0", "throw");
  log("crease " + m.crease);
  await drag(page, line(vp.width / 2, vp.height - 60, vp.width / 2, Math.max(5, m.crease - 200), 12), 14);
  await sleep(300);
  const a = await marks(page);
  log("after foul drag: " + a.text.slice(0, 200));
  await shot(page, "foul");
  await settle(page);
  const b = await marks(page);
  log("settled: " + b.text.slice(0, 200));
  await page.close();
  return errors;
};

// The walkthrough's counter: select the Bell stamp, tap a hole on the board.
tests.stamp = async (browser) => {
  const { page, errors } = await newPage(browser);
  await fresh(page, { "skee.arrivalDone": "true" });
  await press(page, "TapStart");
  for (let i = 0; i < 300; i++) {
    const m = await marks(page);
    if (m.live.includes("TapLeaveCounter")) break;
    if (m.live.includes("TapGotIt")) { await press(page, "TapGotIt"); continue; }
    if (m.busy === "1") { await sleep(100); continue; }
    if (m.canThrow === "1") { await drag(page, flickPts(m.crease, { xoff: (i % 3 - 1) * 30 }), 14); await sleep(150); await settle(page); continue; }
    if (m.live.includes("TapPull")) { await press(page, "TapPull"); continue; }
    await sleep(100);
  }
  let m = await marks(page);
  const sel = m.live.find((x) => x.startsWith("TapSelectOffer(Some"));
  log("counter: " + m.text.slice(0, 400));
  if (!sel) { log("no board-edit offer this time"); await page.close(); return errors; }
  await press(page, sel);
  await shot(page, "stamp-selected");
  const before = await marks(page);
  // Tap holes from the 10-hole up the middle of the board.
  for (const fy of [0.36, 0.33, 0.30, 0.27, 0.22]) {
    await tapAt(page, vp.width / 2, vp.height * fy);
    m = await marks(page);
    log(`tap board at y=${(vp.height * fy).toFixed(0)}: ${m.text.match(/PRIZE COUNTER \d+/)?.[0]} sel=${m.live.filter((x) => x.startsWith("TapSelect"))}`);
    if (m.text !== before.text) break;
  }
  await sleep(400);
  await shot(page, "stamp-applied");
  log("after stamp: " + m.text.slice(0, 400));
  await page.close();
  return errors;
};

// The prize shop with winnings, then reload: owned survives.
tests.shop = async (browser) => {
  const { page, errors } = await newPage(browser);
  const wallet = JSON.stringify({ balance: 1340, comps: [], gamesSinceHost: 0, hostVisits: 0, lifetime: 1340, owned: [], progressive: { meters: ["mini", 50, "minor", 150, "major", 600, "grand", 2500] }, room: "boardwalk", rooms: ["boardwalk"] });
  await fresh(page, { ...done, "skee.wallet": wallet });
  let m = await marks(page);
  log("title: " + m.text);
  await press(page, "TapOpenShop");
  m = await marks(page);
  log("shop: " + m.text);
  log("shop live: " + JSON.stringify(m.live));
  await shot(page, "shop");
  const buys = m.live.filter((x) => x.startsWith("TapBuyPrize"));
  for (const b of buys.slice(0, 3)) { await press(page, b); }
  await sleep(400);
  m = await marks(page);
  log("after buys: " + m.text);
  await shot(page, "shop-bought");
  const w = await page.evaluate(() => localStorage.getItem("skee.wallet"));
  log("wallet: " + w);
  await page.reload({ waitUntil: "load" });
  await waitFor(page, (m) => m.layer !== null, "boot");
  await sleep(500);
  m = await marks(page);
  log("title after reload: " + m.text);
  await shot(page, "title-after-shop");
  await press(page, "TapOpenShop");
  m = await marks(page);
  log("shop after reload: " + m.text);
  await page.close();
  return errors;
};

// Reload while the ball is rolling, and at the prize counter.
tests.reloads = async (browser) => {
  const { page, errors } = await newPage(browser);
  await fresh(page, done);
  await press(page, "TapStart");
  await press(page, "TapPull");
  let m = await waitFor(page, (m) => m.canThrow === "1" && m.busy === "0", "throw");
  const saved0 = await page.evaluate(() => localStorage.getItem("skee.run"));
  await drag(page, flickPts(m.crease), 14);
  await sleep(250);
  m = await marks(page);
  const saved1 = await page.evaluate(() => localStorage.getItem("skee.run"));
  log(`mid-roll busy=${m.busy}; run save grew on release: ${saved1.length > saved0.length}`);
  await shot(page, "mid-roll");
  await page.reload({ waitUntil: "load" });
  await waitFor(page, (m) => m.layer !== null, "boot");
  await sleep(1000);
  m = await marks(page);
  log("after mid-roll reload: " + m.text);
  await shot(page, "after-mid-roll-reload");
  await page.close();
  return errors;
};

// Guide mid-run and coming back; NEW GAME confirm.
tests.guide = async (browser) => {
  const { page, errors } = await newPage(browser);
  await fresh(page, done);
  await press(page, "TapStart");
  await press(page, "TapPull");
  await throwOne(page, {});
  let m = await marks(page);
  const before = m.text;
  await press(page, "TapOpenGuide");
  m = await marks(page);
  log("guide: " + m.text);
  await shot(page, "guide");
  const topics = m.live.filter((x) => x.startsWith("Topic("));
  log("topics " + JSON.stringify(topics));
  for (const t of topics) {
    await press(page, t);
    let pages = 0;
    for (let i = 0; i < 6; i++) { m = await marks(page); pages++; if (m.live.includes("PageNext")) await press(page, "PageNext"); else break; }
    m = await marks(page);
    log(`  ${t}: ${pages} pages; ${m.text.slice(0, 120)}`);
    for (let i = 0; i < 8; i++) { m = await marks(page); if (m.live.some((x) => x.startsWith("Topic("))) break; await press(page, "PageBack"); }
  }
  await press(page, "TapCloseGuide");
  m = await marks(page);
  log(`back from guide same state: ${m.text === before}`);
  await page.close();
  return errors;
};

// A long run with the best throws we can find: try to clear a round.
tests.long = async (browser) => {
  const { page, errors } = await newPage(browser);
  await fresh(page, done);
  await press(page, "TapStart");
  const variants = [{ gap: 14 }, { gap: 12, steps: 6 }, { gap: 18 }, { gap: 22 }, { gap: 10, steps: 5 }, { gap: 16, xoff: 20 }, { gap: 16, xoff: -20 }];
  const score = {};
  let rounds = [];
  for (let i = 0; i < 200; i++) {
    let m = await marks(page);
    if (m.live.includes("TapGotIt")) { log("  card: " + (m.text.match(/([A-Z][A-Z !',.?]{5,}) SKIP/)?.[1])); await press(page, "TapGotIt"); continue; }
    if (m.live.includes("TapLeaveCounter")) {
      log("COUNTER: " + m.text.slice(0, 300)); await shot(page, "long-counter");
      const b = m.live.find((x) => x.startsWith("TapBuyOffer")); if (b) { await press(page, b); m = await marks(page); log("  bought -> " + m.text.match(/PRIZE COUNTER \d+/)?.[0]); }
      await dismissCards(page);
      await press(page, "TapLeaveCounter"); continue;
    }
    if (m.live.includes("TapNewRun") && /GAME OVER/.test(m.text)) { log("GAME OVER: " + m.text.slice(0, 300)); await shot(page, "long-gameover"); break; }
    if (m.busy === "1") { await sleep(100); continue; }
    if (m.canThrow === "1") {
      const v = variants[i % variants.length];
      const s0 = Number(m.text.match(/(\d+) \/ \d+/)?.[1]);
      await drag(page, flickPts(m.crease, v), v.gap); await sleep(150); await settle(page);
      const m2 = await marks(page);
      const r = m2.text.match(/(ANTE \d\/8 [A-Z -]+?) (\d+) \/ (\d+)/);
      if (r) { const k = r[1]; if (!rounds.includes(k)) { rounds.push(k); log("ROUND " + k + " target " + r[3]); } }
      continue;
    }
    if (m.live.includes("TapPull")) { await press(page, "TapPull"); continue; }
    await sleep(100);
  }
  log("rounds seen: " + JSON.stringify(rounds));
  await page.close();
  return errors;
};

const browser = await puppeteer.launch({ executablePath: chrome, headless: true });
try {
  for (const [name, fn] of Object.entries(tests)) {
    if (only && !only.split(",").includes(name)) continue;
    log(`=== ${name} (${which})`);
    try { const errs = await fn(browser); log(`console(${name}): ${errs.length ? errs.join(" | ") : "clean"}`); }
    catch (e) { log(`EXCEPTION in ${name}: ${e.stack}`); }
  }
} finally { await browser.close(); }
