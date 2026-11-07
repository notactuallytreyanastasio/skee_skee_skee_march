// Shared helpers for the round-1 visual/feel playtest.
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
export const here = dirname(fileURLToPath(import.meta.url));
export const shots = join(here, "shots");
mkdirSync(shots, { recursive: true });
export const URL = process.env.URL || "http://127.0.0.1:8191/";
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const PHONE = { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true };
export const DESK = { width: 1280, height: 800, deviceScaleFactor: 1 };
export async function launch() {
  return puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true,
    args: ["--autoplay-policy=no-user-gesture-required", "--enable-gpu-rasterization", "--ignore-gpu-blocklist"] });
}
export async function open(browser, vp, { clear = true } = {}) {
  const page = await browser.newPage();
  const log = [];
  page.on("console", (m) => log.push(`${m.type()}: ${m.text()}`));
  page.on("pageerror", (e) => log.push("pageerror: " + e.message));
  page.on("response", (r) => { if (r.status() >= 400) log.push(`http ${r.status()}: ${r.url()}`); });
  await page.setViewport(vp);
  await page.goto(URL, { waitUntil: "load" });
  if (clear) { await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: "load" }); }
  await page.evaluate(() => document.fonts.ready);
  await sleep(700);
  return { page, log };
}
export async function marks(page) {
  return page.evaluate(() => {
    const el = document.documentElement;
    return { layer: el.getAttribute("data-layer"), canThrow: el.getAttribute("data-can-throw"), busy: el.getAttribute("data-busy"),
      crease: Number(el.getAttribute("data-crease-y")), audio: el.getAttribute("data-audio"),
      live: [...document.querySelectorAll("#hud [data-intent]")].map((b) => b.dataset.intent) };
  });
}
export async function text(page) { return page.evaluate(() => document.getElementById("hud").innerText.replace(/\s+/g, " ")); }
export async function waitFor(page, pred, what, ms = 10000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { const m = await marks(page); if (pred(m)) return m; await sleep(50); }
  const m = await marks(page); console.log("TIMEOUT " + what + ": " + JSON.stringify(m)); return null;
}
export async function press(page, intent, touch) {
  const sel = `#hud [data-intent="${intent}"]`;
  await page.waitForSelector(sel, { timeout: 6000 });
  if (touch) await page.tap(sel); else await page.click(sel);
  await sleep(200);
}
export async function shot(page, name) { const p = join(shots, name + ".png"); await page.screenshot({ path: p }); return p; }
// A flick: from (x0,y0) to (x1,y1) in `steps` moves `gap` ms apart, with an easing curve like a thumb.
export async function flick(page, touch, x0, y0, x1, y1, steps = 8, gap = 16) {
  const ease = (t) => 1 - (1 - t) * (1 - t);
  if (touch) {
    await page.touchscreen.touchStart(x0, y0);
    for (let i = 1; i <= steps; i++) { await sleep(gap); const t = ease(i / steps); await page.touchscreen.touchMove(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t); }
    await page.touchscreen.touchEnd();
  } else {
    await page.mouse.move(x0, y0); await page.mouse.down();
    for (let i = 1; i <= steps; i++) { await sleep(gap); const t = ease(i / steps); await page.mouse.move(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t); }
    await page.mouse.up();
  }
}
