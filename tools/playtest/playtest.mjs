// Headless Chrome playtest of the web build (make serve).
//   node tools/playtest/playtest.mjs [url]     (default http://127.0.0.1:8137/)
// For each viewport (390x844 phone with touch, 1280x800 desktop with a
// mouse): a fresh page, the first launch through the stub HUD's buttons
// (title, Sal, the host placeholder, the walkthrough skipped), the lever, then
// a flick with timed pointer events. Screenshots go to tools/playtest/shots/.
// Fails on any console error or page error, if the ball never leaves the
// hand, or if frames stop.
import puppeteer from "puppeteer-core";
import { mkdirSync, writeFileSync } from "node:fs";
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

async function marks(page) {
  return page.evaluate(() => {
    const el = document.documentElement;
    return {
      layer: el.getAttribute("data-layer"),
      canThrow: el.getAttribute("data-can-throw"),
      busy: el.getAttribute("data-busy"),
      crease: Number(el.getAttribute("data-crease-y")),
      buttons: [...document.querySelectorAll("#hud .dev-tap")].map((b) => b.dataset.intent),
    };
  });
}

async function tap(page, intent) {
  const sel = `#hud .dev-tap[data-intent="${intent}"]`;
  await page.waitForSelector(sel, { timeout: 5000 });
  await page.click(sel);
  await sleep(120);
}

async function waitFor(page, pred, what, ms = 8000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const m = await marks(page);
    if (pred(m)) return m;
    await sleep(50);
  }
  fail("timed out waiting for " + what + ": " + JSON.stringify(await marks(page)));
  return marks(page);
}

async function frameCount(page, ms) {
  return page.evaluate((ms) => new Promise((res) => {
    let n = 0; const t0 = performance.now();
    const f = () => { n++; if (performance.now() - t0 < ms) requestAnimationFrame(f); else res(n); };
    requestAnimationFrame(f);
  }), ms);
}

// A flick from low on the lane to just short of the crease, in `steps` moves
// spaced `gap` ms apart: the pointer events carry those real timestamps.
async function flick(page, w, h, crease, touch, steps = 8, gap = 14) {
  const x = w / 2, y0 = h - 40, y1 = crease + 12;
  if (touch) {
    await page.touchscreen.touchStart(x, y0);
    for (let i = 1; i <= steps; i++) {
      await sleep(gap);
      await page.touchscreen.touchMove(x + i * 0.5, y0 + (y1 - y0) * (i / steps));
    }
    await page.touchscreen.touchEnd();
  } else {
    await page.mouse.move(x, y0);
    await page.mouse.down();
    for (let i = 1; i <= steps; i++) {
      await sleep(gap);
      await page.mouse.move(x + i * 0.5, y0 + (y1 - y0) * (i / steps));
    }
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
  page.on("requestfailed", (r) => errors.push("requestfailed: " + r.url() + " " + (r.failure() && r.failure().errorText)));
  await page.setViewport(viewport);
  await page.goto(url, { waitUntil: "load" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "load" });
  await sleep(800);
  const fps = await frameCount(page, 1000);
  fps > 20 ? ok(`frames run: ${fps} in 1 s`) : fail(`only ${fps} frames in 1 s`);
  await page.screenshot({ path: join(shots, `${name}-1-title.png`) });

  const m0 = await marks(page);
  ok("title buttons: " + m0.buttons.join(" "));
  await tap(page, "TapStart");
  await page.screenshot({ path: join(shots, `${name}-2-sal.png`) });
  for (let i = 0; i < 5; i++) await tap(page, "TapArrivalNext");
  await page.screenshot({ path: join(shots, `${name}-3-host.png`) });
  // The first host: no to AI chat (nothing is sent), DEAL, LEARN TO PLAY.
  await tap(page, "TapHostConsent(false)");
  await tap(page, "TapHostDeal");
  await tap(page, "TapCloseHost");
  await tap(page, "TapSkipWalkthrough");
  let m = await waitFor(page, (m) => m.layer === "LayerBase" && m.busy === "0", "the game, idle");
  ok("in the game: " + JSON.stringify(m));
  if (m.canThrow !== "1" && m.buttons.includes("TapPull")) {
    await tap(page, "TapPull");
    m = await waitFor(page, (m) => m.canThrow === "1" && m.busy === "0", "a throw after the pull", 15000);
  }
  await page.screenshot({ path: join(shots, `${name}-4-ready.png`) });
  if (m.canThrow !== "1") { fail("cannot throw: " + JSON.stringify(m)); await page.close(); return errors; }

  const before = await page.screenshot({ encoding: "base64" });
  await flick(page, viewport.width, viewport.height, m.crease, touch);
  await sleep(60);
  const thrown = await marks(page);
  thrown.canThrow === "0" ? ok("the ball left the hand: " + JSON.stringify(thrown)) : fail("the flick did not throw: " + JSON.stringify(thrown));
  const frames = [];
  for (let i = 0; i < 6; i++) {
    await sleep(180);
    const file = join(shots, `${name}-5-roll-${i}.png`);
    const shot = await page.screenshot({ encoding: "base64" });
    writeFileSync(file, Buffer.from(shot, "base64"));
    frames.push(shot);
  }
  const rollFps = await frameCount(page, 500);
  rollFps >= 25 ? ok(`frames while rolling: ${rollFps * 2}/s`) : fail(`only ${rollFps * 2} frames/s while rolling`);
  const moving = frames.filter((f, i) => f !== (i === 0 ? before : frames[i - 1])).length;
  moving >= 4 ? ok(`the alley changes while the ball rolls (${moving} of 6 frames differ)`) : fail(`only ${moving} of 6 frames differ during the roll`);
  const after = await waitFor(page, (m) => m.busy === "0", "the ball to settle", 20000);
  await page.screenshot({ path: join(shots, `${name}-6-settled.png`) });
  ok("settled: " + JSON.stringify(after));
  await page.close();
  return errors;
}

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  args: ["--autoplay-policy=no-user-gesture-required"],
});
try {
  const phone = await run(browser, "phone", { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true }, true);
  const desk = await run(browser, "desktop", { width: 1280, height: 800, deviceScaleFactor: 1 }, false);
  for (const [n, errs] of [["phone", phone], ["desktop", desk]]) {
    errs.length === 0 ? ok(`${n}: console clean`) : fail(`${n}: console:\n  ` + errs.join("\n  "));
  }
} finally {
  await browser.close();
}
console.log(failures === 0 ? "PLAYTEST PASS" : `PLAYTEST FAIL (${failures})`);
process.exit(failures === 0 ? 0 : 1);
