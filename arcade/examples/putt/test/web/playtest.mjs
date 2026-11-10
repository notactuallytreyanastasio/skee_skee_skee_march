// One flick in headless Chrome: putt's dist/ served on PORT, the first tee
// painted, a mouse flick up the screen, and the putt played back to rest.
//   node test/web/playtest.mjs <dist> <port> <dir holding puppeteer-core's node_modules>
// Checks: the marks putt.mjs sets on <html> (data-phase, data-strokes,
// data-rolling, data-putts), that the canvas is painted, that the speakers
// came up on the gesture and were sent the putt's commands, and a clean
// console. Screenshots in test/web/shots/.
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { serve } from "../../scripts/serve.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const [dist, portArg, modules] = process.argv.slice(2);
if (!dist || !portArg || !modules) {
  console.log("usage: playtest.mjs <dist> <port> <dir with node_modules/puppeteer-core>");
  process.exit(2);
}
const port = Number(portArg);
const req = createRequire(join(resolve(modules), "package.json"));
const puppeteer = (await import(pathToFileURL(req.resolve("puppeteer-core")).href)).default;
const chrome = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const shots = join(here, "shots");
mkdirSync(shots, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
const check = (cond, msg) => { if (cond) console.log("ok   " + msg); else { failures++; console.log("FAIL " + msg); } };

const marks = (page) => page.evaluate(() => {
  const el = document.documentElement;
  const a = globalThis.__puttAudio;
  return {
    phase: el.getAttribute("data-phase"),
    hole: el.getAttribute("data-hole"),
    strokes: el.getAttribute("data-strokes"),
    rolling: el.getAttribute("data-rolling"),
    putts: el.getAttribute("data-putts"),
    audioPath: el.getAttribute("data-audio-path"),
    sent: a ? a.log.flatMap((e) => e.cmds) : null,
  };
});

async function waitFor(page, pred, what, ms = 10000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const m = await marks(page);
    if (pred(m)) return m;
    await sleep(20);
  }
  const m = await marks(page);
  check(false, "timed out waiting for " + what + ": " + JSON.stringify(m));
  return m;
}

const server = await serve(dist, port);
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`http://127.0.0.1:${port}/`);

  const start = await waitFor(page, (m) => m.phase === "aiming", "the first tee");
  check(start.hole === "1" && start.strokes === "0" && start.rolling === "0", `first tee: hole 1, no strokes (${JSON.stringify(start)})`);
  // The middle of the green is the green's colour, not the ground's.
  const painted = await page.evaluate(() => {
    const c = document.getElementById("green");
    const px = c.getContext("2d").getImageData(Math.floor(c.width / 2), Math.floor(c.height / 2), 1, 1).data;
    return [px[0], px[1], px[2]];
  });
  check(painted.join() === "63,155,74", `the green is painted at the centre (rgb ${painted.join()}, want 63,155,74)`);
  await page.screenshot({ path: join(shots, "putt-1-tee.png") });

  // The flick: 14 samples 10 ms apart, 8 px up and 1 px across each,
  // about 800 px/s at lift-off, released while still moving.
  await page.mouse.move(195, 700);
  await page.mouse.down();
  for (let i = 1; i <= 14; i++) {
    await sleep(10);
    await page.mouse.move(195 + i, 700 - 8 * i);
  }
  await page.mouse.up();

  const rolling = await waitFor(page, (m) => m.rolling === "1" || m.putts === "1", "the putt to start", 3000);
  check(rolling.putts === "1", `the flick was a putt (${JSON.stringify({ putts: rolling.putts, rolling: rolling.rolling })})`);
  await sleep(150);
  await page.screenshot({ path: join(shots, "putt-2-rolling.png") });
  const rested = await waitFor(page, (m) => m.rolling === "0", "the ball to rest", 25000);
  check(rested.strokes === "1" || rested.phase === "hole-done", `one stroke on the card (${JSON.stringify({ phase: rested.phase, strokes: rested.strokes })})`);
  await page.screenshot({ path: join(shots, "putt-3-rest.png") });

  check(rested.audioPath === "worklet", `the speakers came up in the worklet on the gesture (data-audio-path=${rested.audioPath})`);
  const sent = rested.sent || [];
  check(sent.some((c) => c === "CmdRumble(0)"), `the synth was sent the ball coming to rest (${JSON.stringify(sent)})`);
  check(errors.length === 0, "a clean console" + (errors.length ? ": " + JSON.stringify(errors) : ""));
} finally {
  await browser.close();
  server.close();
}
console.log(failures === 0 ? "PLAYTEST PASS putt" : `PLAYTEST FAIL putt (${failures})`);
process.exit(failures === 0 ? 0 : 1);
