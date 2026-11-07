// Round 2 functional tests. node tests.mjs <name,...> [phone|desktop]
import { launch, open, PHONE, DESK, sleep } from "../lib.mjs";
import { mkdirSync } from "node:fs";
const url = "http://127.0.0.1:8161/";
const only = (process.argv[2] || "").split(",").filter(Boolean);
const which = process.argv[3] || "phone";
const vp = which === "phone" ? PHONE : DESK;
const D = "/Users/bobdawg/code/skee_skee_skee_march/tools/playtest/r2/shots"; mkdirSync(D, { recursive: true });
const done = { "skee.arrivalDone": "true", "skee.walkthroughDone": "true" };
const card = (t) => (t.match(/([A-Z][A-Z0-9 !',.?]{4,}) SKIP/) || [])[1] || "-";
const log = console.log;
async function reload(g) { await g.page.reload(); await g.page.waitForFunction(() => document.documentElement.getAttribute("data-layer")); await sleep(900); return g.marks(); }
async function cards(g) { for (let k = 0; k < 6; k++) { const m = await g.marks(); if (!m.live.includes("TapGotIt")) return; log("    card " + card(m.text)); await g.press("TapGotIt"); } }
const store = (g) => g.page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)])));
const T = {};

T.reloadspin = async (b) => {
  const g = await open(b, url, vp, done); const S = (w) => g.shot(`${D}/t-${which}-reloadspin-${w}.png`);
  await g.press("TapStart"); await cards(g);
  await g.press("TapPull"); await sleep(300);
  let m = await g.marks(); log("  spinning: busy=" + m.busy + " " + m.text.slice(0, 160)); await S("1-spinning");
  const before = (await store(g))["skee.run"];
  m = await reload(g); log("  after reload during spin: layer=" + m.layer + " can=" + m.can + " live=" + m.live + " | " + m.text.slice(0, 200)); await S("2-after");
  const after = (await store(g))["skee.run"]; log("  run save unchanged by reload: " + (before === after));
  // throw one, then reload while frame scoring
  for (let i = 0; i < 100; i++) { m = await g.marks(); if (m.can === "1" && m.busy === "0") break; if (m.live.includes("TapPull")) await g.press("TapPull"); await sleep(100); }
  for (let k = 0; k < 3; k++) { await g.flick({ gap: 13 }); await sleep(150); await g.settle(); await cards(g); }
  m = await g.marks(); const t1 = m.text.match(/ANTE[^]*?\d+ \/ \d+ \d+/)?.[0]; log("  after 3 balls: " + t1 + " | " + m.text.slice(0, 220));
  await S("3-frame-done");
  m = await reload(g); const t2 = m.text.match(/ANTE[^]*?\d+ \/ \d+ \d+/)?.[0]; log("  after reload: " + t2 + " same=" + (t1 === t2) + " live=" + m.live);
  await S("4-frame-reloaded");
  return g.errors;
};

T.walkreload = async (b) => {
  // reload in the middle of the walkthrough (practice game is not saved)
  const g = await open(b, url, vp, { "skee.arrivalDone": "true" }); const S = (w) => g.shot(`${D}/t-${which}-walkreload-${w}.png`);
  await g.press("TapStart");
  let m = await g.marks(); log("  start: layer " + m.layer + " card " + card(m.text) + " live " + m.live);
  if (m.live.includes("TapCloseHost")) { await g.press("TapCloseHost"); }
  await cards(g); await g.press("TapPull");
  for (let i = 0; i < 100; i++) { m = await g.marks(); if (m.can === "1" && m.busy === "0") break; await sleep(100); }
  await g.flick({}); await sleep(150); await g.settle();
  m = await g.marks(); log("  mid-practice: card " + card(m.text) + " | " + m.text.slice(0, 120));
  m = await reload(g); log("  after reload: layer " + m.layer + " card " + card(m.text) + " live " + m.live + " | " + m.text.slice(0, 160)); await S("after");
  log("  storage " + JSON.stringify(Object.keys(await store(g))));
  return g.errors;
};

T.lose = async (b) => {
  const g = await open(b, url, vp, done); const S = (w) => g.shot(`${D}/t-${which}-lose-${w}.png`);
  const w0 = (await store(g))["skee.wallet"]; log("  wallet before: " + w0);
  await g.press("TapStart"); await cards(g);
  let m;
  for (let i = 0; i < 400; i++) {
    m = await g.marks();
    if (m.live.includes("TapGotIt")) { log("    card " + card(m.text)); await g.press("TapGotIt"); continue; }
    if (m.live.includes("TapNewRun")) break;
    if (m.live.includes("TapLeaveCounter")) { log("  !! reached counter, round cleared by feeble play"); await g.press("TapLeaveCounter"); continue; }
    if (m.busy === "1") { await sleep(80); continue; }
    // a feeble push: slow, short
    if (m.can === "1") { await g.flick({ gap: 45, steps: 4, y1off: 200 }); await sleep(150); await g.settle(); const mm = await g.marks(); log("    feeble -> " + mm.text.match(/ANTE[^]*?\d+ \/ \d+/)?.[0] + " | " + mm.text.match(/FRAME \d\/\d · \d+ BALLS/)?.[0]); continue; }
    if (m.live.includes("TapPull")) { await g.press("TapPull"); continue; }
    await sleep(100);
  }
  m = await g.marks(); log("  END: layer " + m.layer + " live " + m.live + " | " + m.text.slice(0, 500)); await S("1-gameover");
  await cards(g); m = await g.marks(); await S("2-gameover-nocard"); log("  after cards: " + m.text.slice(0, 400));
  const st = await store(g); log("  wallet after: " + st["skee.wallet"]); log("  run after: " + (st["skee.run"] || "").slice(0, 120)); log("  tips " + st["skee.tipsSeen"]);
  m = await reload(g); log("  reload at game over: layer " + m.layer + " live " + m.live + " | " + m.text.slice(0, 200)); await S("3-reload");
  log("  wallet after reload same: " + ((await store(g))["skee.wallet"] === st["skee.wallet"]));
  if (m.live.includes("TapNewRun")) { await g.press("TapNewRun"); await sleep(400); m = await g.marks(); log("  after NEW RUN: layer " + m.layer + " live " + m.live + " | " + m.text.slice(0, 200)); await S("4-newrun"); }
  return g.errors;
};

T.newgame = async (b) => {
  const g = await open(b, url, vp, done); const S = (w) => g.shot(`${D}/t-${which}-newgame-${w}.png`);
  await g.press("TapStart"); await cards(g); await g.press("TapPull");
  let m; for (let i = 0; i < 100; i++) { m = await g.marks(); if (m.can === "1" && m.busy === "0") break; await sleep(100); }
  await g.flick({}); await sleep(150); await g.settle(); await cards(g);
  m = await g.marks(); log("  live " + m.live);
  await g.press("TapAskNewGame"); m = await g.marks(); log("  confirm: layer " + m.layer + " live " + m.live + " | " + m.text.slice(-200)); await S("1-confirm");
  const no = m.live.find((x) => /Cancel|Keep|No/.test(x)); if (no) { await g.press(no); m = await g.marks(); log("  after " + no + ": " + m.layer + " balls " + m.text.match(/\d+ BALLS/)?.[0]); }
  await g.press("TapAskNewGame"); m = await g.marks(); const yes = m.live.find((x) => /Confirm|Yes|NewRun|NewGame/.test(x) && x !== "TapAskNewGame"); log("  yes intent " + yes);
  const w0 = JSON.parse((await store(g))["skee.wallet"]);
  if (yes) { await g.press(yes); await sleep(300); m = await g.marks(); log("  after confirm: layer " + m.layer + " live " + m.live + " | " + m.text.slice(0, 200)); await S("2-after"); }
  const w1 = JSON.parse((await store(g))["skee.wallet"]); log(`  gamesSinceHost ${w0.gamesSinceHost} -> ${w1.gamesSinceHost}`);
  return g.errors;
};

T.rooms = async (b) => {
  const wallet = JSON.stringify({ balance: 300, comps: ["neonLounge", { nights: 2, tickets: 3, room: "neonLounge", credit: 0 }], gamesSinceHost: 0, hostVisits: 1, lifetime: 1700, owned: ["sticker"], progressive: { meters: ["mini", 50, "minor", 150, "major", 600, "grand", 2500] }, room: "boardwalk", rooms: ["boardwalk", "neonLounge"] });
  const g = await open(b, url, vp, { ...done, "skee.wallet": wallet }); const S = (w) => g.shot(`${D}/t-${which}-rooms-${w}.png`);
  let m = await g.marks(); log("  title live " + m.live + " | " + m.text); await S("1-title");
  const neon = m.live.find((x) => /Neon/.test(x)); if (neon) { await g.press(neon); await sleep(500); m = await g.marks(); log("  picked neon: " + m.text); await S("2-neon"); }
  log("  wallet room " + JSON.parse((await store(g))["skee.wallet"]).room);
  m = await reload(g); log("  after reload: " + m.text.slice(0, 200)); await S("3-neon-reload");
  await g.press("TapStart"); await sleep(500); m = await g.marks(); log("  start in neon: layer " + m.layer + " | " + m.text.slice(0, 200)); await S("4-neon-game");
  log("  wallet comps after checkin " + JSON.stringify(JSON.parse((await store(g))["skee.wallet"]).comps));
  return g.errors;
};

T.shop = async (b) => {
  const wallet = JSON.stringify({ balance: 1340, comps: [], gamesSinceHost: 0, hostVisits: 0, lifetime: 1340, owned: [], progressive: { meters: ["mini", 50, "minor", 150, "major", 600, "grand", 2500] }, room: "boardwalk", rooms: ["boardwalk"] });
  const g = await open(b, url, vp, { ...done, "skee.wallet": wallet }); const S = (w) => g.shot(`${D}/t-${which}-shop-${w}.png`);
  await g.press("TapOpenShop"); let m = await g.marks(); log("  shop: " + m.text + " live " + m.live); await S("1-shop");
  for (const x of m.live.filter((x) => x.startsWith("TapBuyPrize"))) { await g.press(x); }
  m = await g.marks(); log("  after buys: " + m.text); await S("2-bought");
  // try buying an unaffordable/owned one
  const tryAll = await g.page.evaluate(() => [...document.querySelectorAll("#hud [data-act]")].map((e) => e.dataset.intent));
  log("  clickable now " + tryAll);
  const w = JSON.parse((await store(g))["skee.wallet"]); log(`  wallet balance ${w.balance} lifetime ${w.lifetime} owned ${w.owned}`);
  m = await reload(g); log("  title after reload: " + m.text.slice(0, 260)); await S("3-title-reload");
  return g.errors;
};

T.guide = async (b) => {
  const g = await open(b, url, vp, done); const S = (w) => g.shot(`${D}/t-${which}-guide-${w}.png`);
  await g.press("TapHowToPlay"); let m = await g.marks(); log("  guide from title: " + m.text.slice(0, 300) + " live " + m.live); await S("1-title-guide");
  const topics = m.live.filter((x) => /Topic/.test(x)); log("  topics " + topics);
  for (const t of topics) { await g.press(t); let pages = 1; m = await g.marks(); const first = m.text.slice(0, 80); for (let i = 0; i < 10; i++) { m = await g.marks(); if (m.live.includes("PageNext")) { await g.press("PageNext"); pages++; } else break; } log(`    ${t}: ${pages} pages`); await S("2-" + t.replace(/\W/g, "")); for (let i = 0; i < 12; i++) { m = await g.marks(); if (m.live.some((x) => /Topic/.test(x))) break; const back = m.live.find((x) => /Back/.test(x)); if (!back) break; await g.press(back); } }
  m = await g.marks(); const close = m.live.find((x) => /Close/.test(x)); log("  close intent " + close); if (close) await g.press(close);
  m = await g.marks(); log("  after close layer " + m.layer + " live " + m.live);
  return g.errors;
};

const b = await launch();
try { for (const [k, f] of Object.entries(T)) { if (only.length && !only.includes(k)) continue; log(`=== ${k} (${which})`); try { const e = await f(b); log(`  console: ${e.length ? e.join(" | ") : "clean"}`); } catch (e) { log("  EXCEPTION " + e.stack); } } } finally { await b.close(); }
