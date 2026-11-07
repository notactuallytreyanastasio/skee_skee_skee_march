// Headless Chrome playtest of the HUD (shell/hud.march over Skee.HudView).
//   node tools/playtest/hud_playtest.mjs [url]   (default http://127.0.0.1:8137/)
// Needs `npm install` in tools/playtest once, and a running `make serve`.
// For a 390x844 touch phone (taps) and a 1280x800 mouse desktop (clicks):
// title, the prize shop, Sal, the host placeholder, the first coach card,
// the machine, the Guide (contents and a page), a pull, a flick and the
// settled frame, every step driven through the HUD's own buttons by their
// data-intent. Checks: each screen's words, that idle frames rewrite no pane,
// that a button under an overlay is not tappable, and a clean console.
// Screenshots: tools/playtest/shots/hud-<viewport>-<n>-<what>.png.
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const shots = join(here, "shots");
mkdirSync(shots, { recursive: true });
const url = process.argv[2] || "http://127.0.0.1:8137/";
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
const fail = (msg) => { failures++; console.log("FAIL " + msg); };
const ok = (msg) => console.log("ok   " + msg);
const check = (cond, msg) => (cond ? ok(msg) : fail(msg));

async function marks(page) {
  return page.evaluate(() => {
    const el = document.documentElement;
    return {
      layer: el.getAttribute("data-layer"),
      canThrow: el.getAttribute("data-can-throw"),
      busy: el.getAttribute("data-busy"),
      crease: Number(el.getAttribute("data-crease-y")),
      live: [...document.querySelectorAll("#hud [data-intent]")].map((b) => b.dataset.intent),
    };
  });
}

async function waitFor(page, pred, what, ms = 10000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const m = await marks(page);
    if (pred(m)) return m;
    await sleep(50);
  }
  fail("timed out waiting for " + what + ": " + JSON.stringify(await marks(page)));
  return marks(page);
}

async function text(page) {
  return page.evaluate(() => document.getElementById("hud").innerText.replace(/\s+/g, " "));
}

async function shows(page, words, where) {
  const t = await text(page);
  const missing = words.filter((w) => !t.includes(w));
  check(missing.length === 0, `${where} shows ${JSON.stringify(words)}` + (missing.length ? ` (missing ${JSON.stringify(missing)})` : ""));
}

// Press a HUD button the way the viewport does: a touch tap or a mouse click.
async function press(page, intent, touch) {
  const sel = `#hud [data-intent="${intent}"]`;
  await page.waitForSelector(sel, { timeout: 6000 });
  if (touch) await page.tap(sel); else await page.click(sel);
  await sleep(150);
}

async function shot(page, name, n, what) {
  await page.screenshot({ path: join(shots, `hud-${name}-${n}-${what}.png`) });
}

// Panes rewritten over `ms` of frames: a MutationObserver on the HUD.
async function rewrites(page, ms) {
  return page.evaluate((ms) => new Promise((res) => {
    let n = 0;
    const o = new MutationObserver((list) => { n += list.length; });
    o.observe(document.getElementById("hud"), { childList: true, subtree: true });
    setTimeout(() => { o.disconnect(); res(n); }, ms);
  }), ms);
}

async function flick(page, w, h, crease, touch, steps = 8, gap = 14) {
  const x = w / 2, y0 = h - 40, y1 = crease + 12;
  if (touch) {
    await page.touchscreen.touchStart(x, y0);
    for (let i = 1; i <= steps; i++) { await sleep(gap); await page.touchscreen.touchMove(x + i * 0.5, y0 + (y1 - y0) * (i / steps)); }
    await page.touchscreen.touchEnd();
  } else {
    await page.mouse.move(x, y0);
    await page.mouse.down();
    for (let i = 1; i <= steps; i++) { await sleep(gap); await page.mouse.move(x + i * 0.5, y0 + (y1 - y0) * (i / steps)); }
    await page.mouse.up();
  }
}

async function run(browser, name, viewport, touch) {
  console.log(`--- ${name} ${viewport.width}x${viewport.height}`);
  const page = await browser.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errors.push(`${m.type()}: ${m.text()}`); });
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("response", (r) => { if (r.status() >= 400) errors.push(`http ${r.status()}: ${r.url()}`); });
  await page.setViewport(viewport);
  await page.goto(url, { waitUntil: "load" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await sleep(900);

  await shows(page, ["SKEE", "TAP TO PLAY", "THE BOARDWALK ARCADE", "PRIZE SHOP · 0", "HOW TO PLAY", "BOARDWALK", "PENTHOUSE"], "title");
  const idle = await rewrites(page, 1000);
  check(idle === 0, `an idle title rewrites no pane (${idle} mutations in 1 s)`);
  await shot(page, name, 1, "title");

  await press(page, "TapOpenShop", touch);
  await waitFor(page, (m) => m.layer === "LayerShop", "the shop");
  await shows(page, ["PRIZE SHOP", "0 WINNINGS", "Gold Star Sticker", "Rubber Duck", "BACK"], "shop");
  const under = await marks(page);
  check(!under.live.includes("TapStart"), "the title under the shop is not tappable");
  await shot(page, name, 2, "shop");
  await press(page, "TapCloseShop", touch);
  await waitFor(page, (m) => m.layer === "LayerBase", "back on the title");

  await press(page, "TapStart", touch);
  await waitFor(page, (m) => m.layer === "LayerArrival", "Sal");
  await shows(page, ["WELCOME TO", "SKEE SKEE SKEE", "SAL", "Well, look who walked in!", "GO ON"], "arrival");
  await shot(page, name, 3, "sal");
  for (let i = 0; i < 5; i++) await press(page, "TapArrivalNext", touch);
  await waitFor(page, (m) => m.layer === "LayerHost", "the host placeholder");
  await shows(page, ["THE HOST", "PLACEHOLDER", "CLOSE"], "host");
  await shot(page, name, 4, "host");
  await press(page, "TapCloseHost", touch);
  await waitFor(page, (m) => m.layer === "LayerCoachBlock", "the first coach card");
  await shows(page, ["YOUR FIRST LOADOUT", "SKIP", "GOT IT"], "coach");
  await shot(page, name, 5, "coach");
  await press(page, "TapSkipWalkthrough", touch);
  let m = await waitFor(page, (m) => m.layer === "LayerBase" && m.busy === "0" && m.live.includes("TapPull"), "the machine");
  await shows(page, ["ANTE 1/8", "WARM-UP", "SPIN", "FRAME 1/3 · 9 BALLS", "NEW GAME", "GUIDE"], "machine");
  await shot(page, name, 6, "machine");

  await press(page, "TapOpenGuide", touch);
  await waitFor(page, (m) => m.layer === "LayerGuide", "the guide");
  await shows(page, ["THE GUIDE", "The Big Idea", "PLAY THE FIRST LOADOUT AGAIN", "DONE"], "guide");
  await shot(page, name, 7, "guide");
  await press(page, "Topic(0)", touch);
  await shows(page, ["THE BIG IDEA", "PAGE 1 OF 3", "NEXT"], "guide page 1");
  await press(page, "PageNext", touch);
  await shows(page, ["PAGE 2 OF 3"], "guide page 2");
  await shot(page, name, 8, "guide-page");
  await press(page, "PageBack", touch);
  await press(page, "PageBack", touch);
  await shows(page, ["THE GUIDE"], "back to the topics");
  await press(page, "TapCloseGuide", touch);
  await waitFor(page, (m) => m.layer === "LayerBase", "the game again");

  await press(page, "TapPull", touch);
  m = await waitFor(page, (m) => m.canThrow === "1" && m.busy === "0", "a throw after the pull", 15000);
  await shows(page, ["TARGETS", "thumb down on your line"], "after the pull");
  const fps = await page.evaluate(() => new Promise((res) => {
    let n = 0; const t0 = performance.now();
    const f = () => { n++; if (performance.now() - t0 < 1000) requestAnimationFrame(f); else res(n); };
    requestAnimationFrame(f);
  }));
  check(fps >= 40, `frames with the HUD up: ${fps} in 1 s`);
  await shot(page, name, 9, "game");
  await flick(page, viewport.width, viewport.height, m.crease, touch);
  await sleep(80);
  const thrown = await marks(page);
  check(thrown.canThrow === "0", "a flick on the lane under the HUD throws");
  await sleep(700);
  await shot(page, name, 10, "rolling");
  await waitFor(page, (m) => m.busy === "0", "the ball to settle", 20000);
  await shot(page, name, 11, "settled");

  const tip = await marks(page);
  if (tip.live.includes("TapGotIt")) {
    await shows(page, ["GOT IT"], "a tip card after the ball");
    await shot(page, name, 12, "tip");
    await press(page, "TapGotIt", touch);
    await waitFor(page, (m) => m.live.includes("TapAskNewGame"), "the tip card read");
  }
  await press(page, "TapAskNewGame", touch);
  await waitFor(page, (m) => m.layer === "LayerConfirmNew", "the new game prompt");
  await shows(page, ["START A NEW GAME?", "KEEP PLAYING"], "prompt");
  await shot(page, name, 13, "prompt");
  await press(page, "TapKeepPlaying", touch);
  await waitFor(page, (m) => m.layer === "LayerBase", "kept playing");
  await page.close();
  return errors;
}

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });
try {
  const phone = await run(browser, "phone", { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true }, true);
  const desk = await run(browser, "desktop", { width: 1280, height: 800, deviceScaleFactor: 1 }, false);
  for (const [n, errs] of [["phone", phone], ["desktop", desk]]) {
    errs.length === 0 ? ok(`${n}: console clean`) : fail(`${n}: console:\n  ` + errs.join("\n  "));
  }
} finally {
  await browser.close();
}
console.log(failures === 0 ? "HUD PLAYTEST PASS" : `HUD PLAYTEST FAIL (${failures})`);
process.exit(failures === 0 ? 0 : 1);
