// The share card, web/og.png (1200x630), shot from the real game.
//   make serve (in another shell), then: make og   (or node tools/playtest/og.mjs [url])
// Plays the first launch on a phone-sized page (Sal, AI chat off, the deal,
// walkthrough skipped), pulls the lever, flicks one ball, and catches the
// alley while it rolls. The shot goes beside the title on og_card.html,
// rendered at 1200x630.
import puppeteer from "puppeteer-core";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const url = process.argv[2] || "http://127.0.0.1:8137/";
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const W = 390, H = 844;

const marks = (page) => page.evaluate(() => {
  const el = document.documentElement;
  return {
    layer: el.getAttribute("data-layer"),
    canThrow: el.getAttribute("data-can-throw"),
    busy: el.getAttribute("data-busy"),
    crease: Number(el.getAttribute("data-crease-y")),
  };
});

async function waitFor(page, pred, what, ms = 15000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const m = await marks(page);
    if (pred(m)) return m;
    await sleep(50);
  }
  throw new Error("og: timed out waiting for " + what + ": " + JSON.stringify(await marks(page)));
}

async function press(page, intent) {
  const sel = `#hud [data-intent="${intent}"]`;
  await page.waitForSelector(sel, { timeout: 6000 });
  await page.tap(sel);
  await sleep(150);
}

const browser = await puppeteer.launch({ executablePath: chrome, headless: true });
try {
  const game = await browser.newPage();
  await game.setViewport({ width: W, height: H, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await game.goto(url, { waitUntil: "load" });
  await game.evaluate(() => localStorage.clear());
  await game.reload({ waitUntil: "load" });
  await game.evaluate(() => document.fonts.ready);
  await sleep(900);

  await press(game, "TapStart");
  await waitFor(game, (m) => m.layer === "LayerArrival", "Sal");
  for (let i = 0; i < 5; i++) await press(game, "TapArrivalNext");
  await waitFor(game, (m) => m.layer === "LayerHost", "the first host");
  await press(game, "TapHostConsent(false)");
  await press(game, "TapHostDeal");
  await sleep(400);
  await press(game, "TapCloseHost");
  await waitFor(game, (m) => m.layer === "LayerCoachBlock", "the coach card");
  await press(game, "TapSkipWalkthrough");
  await waitFor(game, (m) => m.layer === "LayerBase" && m.busy === "0", "the machine");
  await press(game, "TapPull");
  const m = await waitFor(game, (m) => m.canThrow === "1" && m.busy === "0", "a throw after the pull");

  // A straight flick from low on the lane to just short of the crease.
  const x = W / 2, y0 = H - 40, y1 = m.crease + 12;
  await game.touchscreen.touchStart(x, y0);
  for (let i = 1; i <= 8; i++) { await sleep(14); await game.touchscreen.touchMove(x, y0 + (y1 - y0) * (i / 8)); }
  await game.touchscreen.touchEnd();
  await sleep(850);
  // The cabinet from the HUD's top bar down to the start of the lane.
  const shot = await game.screenshot({ encoding: "base64", clip: { x: 0, y: 0, width: W, height: 640 } });

  const card = readFileSync(join(here, "og_card.html"), "utf8").replace("ALLEY_PNG", "data:image/png;base64," + shot);
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page.setContent(card, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  writeFileSync(join(root, "web", "og.png"), await page.screenshot({ type: "png" }));
  console.log("og: wrote web/og.png");
} finally {
  await browser.close();
}
