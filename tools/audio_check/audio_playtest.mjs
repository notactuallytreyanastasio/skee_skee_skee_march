// Headless Chrome check of the web build's audio (make audio-check, after make web).
//   node tools/audio_check/audio_playtest.mjs [port]      (default 8139)
// Serves dist/ itself, then:
//   1. parity: the shipped worklet (dist/skee_synth_worklet.mjs) in an
//      OfflineAudioContext at 44100 Hz renders every golden scenario that is
//      one cue then silence, and its samples are compared with the real
//      Swift Synth's (test/golden/synth.march) at 2^-22 per sample;
//   2. the game, with Chrome's default autoplay policy on a 390x844 touch
//      page: no AudioContext before a gesture, one that reaches "running" on
//      the AudioWorklet path after the first tap, the cue timeline of one
//      throw (sent on the page clock, taken by the synth on the audio clock),
//      a non-silent peak, and a clean console (errors and warnings).
// Uses tools/playtest's puppeteer-core (npm install there once).
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { scenarios, fromBits, bitsOf } from "./golden.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const require = createRequire(join(root, "tools", "playtest", "package.json"));
const puppeteer = require("puppeteer-core");
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const port = Number(process.argv[2] || 8139);
const url = `http://127.0.0.1:${port}/`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
const fail = (msg) => { failures++; console.log("FAIL " + msg); };
const ok = (msg) => console.log("ok   " + msg);

async function parity(browser) {
  console.log("--- parity: the worklet build against the Swift Synth");
  const page = await browser.newPage();
  await page.goto(url + "index.html?parity", { waitUntil: "domcontentloaded" });
  const tol = Math.pow(2, -22);
  let compared = 0, differ = 0, worst = 0, bad = 0;
  const list = scenarios(root);
  for (const s of list) {
    const got = await page.evaluate(async (sound, len, idx) => {
      const ctx = new OfflineAudioContext(1, len, 44100);
      await ctx.audioWorklet.addModule("skee_synth_worklet.mjs");
      const cmds = { $: "Cons", _0: { $: "CmdPlay", _0: sound }, _1: { $: "Nil" } };
      const node = new AudioWorkletNode(ctx, "skee-synth", {
        numberOfInputs: 0, numberOfOutputs: 1, outputChannelCount: [1], processorOptions: { cmds },
      });
      node.connect(ctx.destination);
      const buf = await ctx.startRendering();
      const data = buf.getChannelData(0);
      return idx.map((i) => data[i]);
    }, s.sound, s.len, s.kept.map((k) => k[0]));
    let d = 0, w = 0;
    s.kept.forEach(([, bits], i) => {
      const want = fromBits(bits);
      const err = Math.abs(got[i] - want);
      if (bitsOf(got[i]) !== bits) d++;
      if (err > w) w = err;
    });
    compared += s.kept.length; differ += d; worst = Math.max(worst, w);
    if (w > tol) { bad++; fail(`${s.name}: worst ${w} past 2^-22`); }
  }
  await page.close();
  const line = `${list.length} scenarios, ${compared} samples, ${differ} not bit-identical, worst |error| ${worst.toExponential(3)} (tolerance 2^-22 = ${tol.toExponential(3)})`;
  bad === 0 && list.length > 0 && compared > 0 ? ok("worklet output is Skee.Synth's: " + line) : fail(line);
}

async function marks(page) {
  return page.evaluate(() => {
    const el = document.documentElement;
    return {
      layer: el.getAttribute("data-layer"),
      canThrow: el.getAttribute("data-can-throw"),
      busy: el.getAttribute("data-busy"),
      crease: Number(el.getAttribute("data-crease-y")),
      audio: el.getAttribute("data-audio"),
      path: el.getAttribute("data-audio-path"),
      buttons: [...document.querySelectorAll("#hud .dev-tap")].map((b) => b.dataset.intent),
    };
  });
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

async function tap(page, intent) {
  const sel = `#hud .dev-tap[data-intent="${intent}"]`;
  await page.waitForSelector(sel, { timeout: 5000 });
  await page.click(sel);
  await sleep(120);
}

async function game(browser) {
  console.log("--- the game: gesture, worklet, one throw");
  const page = await browser.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errors.push(`${m.type()}: ${m.text()}`); });
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("requestfailed", (r) => errors.push("requestfailed: " + r.url()));
  page.on("response", (r) => { if (r.status() >= 400) errors.push(`http ${r.status()}: ${r.url()}`); });
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await page.goto(url, { waitUntil: "load" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "load" });
  await sleep(600);
  const m0 = await marks(page);
  m0.audio === "none" && m0.path === "off" ? ok("no AudioContext before a gesture: " + JSON.stringify({ audio: m0.audio, path: m0.path })) : fail("audio before a gesture: " + JSON.stringify(m0));

  await tap(page, "TapStart");
  const m1 = await waitFor(page, (m) => m.audio === "running" && m.path === "worklet", "the AudioContext running on the worklet", 5000);
  const rate = await page.evaluate(() => globalThis.__skeeAudio.stats.rate);
  m1.audio === "running" ? ok(`after the first tap: ${m1.audio} on the ${m1.path} path at ${rate} Hz`) : null;
  rate === 44100 ? ok("context at the synth's 44100 Hz") : fail("context rate " + rate);

  for (let i = 0; i < 5; i++) await tap(page, "TapArrivalNext");
  await tap(page, "TapCloseHost");
  await tap(page, "TapSkipWalkthrough");
  let m = await waitFor(page, (m) => m.layer === "LayerBase" && m.busy === "0", "the game, idle");
  if (m.canThrow !== "1" && m.buttons.includes("TapPull")) {
    await tap(page, "TapPull");
    m = await waitFor(page, (m) => m.canThrow === "1" && m.busy === "0", "a throw after the pull", 15000);
  }
  if (m.canThrow !== "1") { fail("cannot throw: " + JSON.stringify(m)); await page.close(); return errors; }

  const mark0 = await page.evaluate(() => globalThis.__skeeAudio.log.length);
  const x = 195, y0 = 844 - 40, y1 = m.crease + 12;
  const t0 = await page.evaluate(() => performance.now() / 1000);
  await page.touchscreen.touchStart(x, y0);
  for (let i = 1; i <= 8; i++) { await sleep(14); await page.touchscreen.touchMove(x + i * 0.5, y0 + (y1 - y0) * (i / 8)); }
  await page.touchscreen.touchEnd();
  await sleep(100);
  await waitFor(page, (m) => m.busy === "0", "the ball to settle", 20000);
  await sleep(1600);
  const { log, stats } = await page.evaluate(() => ({ log: globalThis.__skeeAudio.log, stats: globalThis.__skeeAudio.stats }));
  const thrown = log.slice(mark0);
  console.log("     cue timeline of one throw (t: page clock from the touch, s; synth: audio clock when the synth took it, s; lag: ms from send):");
  let plays = 0, untaken = 0, worstLag = 0;
  for (const e of thrown) {
    const taken = e.frame === null ? null : e.frame / 44100;
    const lag = taken === null ? null : (taken - e.audio) * 1000;
    if (taken === null) untaken++; else worstLag = Math.max(worstLag, lag);
    plays += e.cmds.filter((c) => !c.startsWith("CmdRumble") && !c.startsWith("CmdDrum")).length;
    console.log(`       t=${(e.t - t0).toFixed(3)}  synth=${taken === null ? "-" : taken.toFixed(3)}  lag=${lag === null ? "-" : lag.toFixed(1)}  ${e.cmds.join(", ")}`);
  }
  plays > 0 ? ok(`the throw sent ${thrown.length} batches, ${plays} cues`) : fail("the throw sent no cues");
  untaken === 0 ? ok(`every batch reached the synth, worst ${worstLag.toFixed(1)} ms after it was sent`) : fail(`${untaken} batches never reached the synth`);
  stats.peak > 0 ? ok(`the speakers are not silent: last peak ${stats.peak.toFixed(4)} at frame ${stats.frame}`) : fail("peak 0: nothing played");
  if (stats.underruns) ok("playbackStats: " + JSON.stringify(stats.underruns));
  await page.close();
  return errors;
}

const server = spawn(process.execPath, [join(root, "tools", "serve", "serve.mjs"), join(root, "dist"), String(port)], { stdio: ["ignore", "pipe", "inherit"] });
await new Promise((res) => server.stdout.once("data", res));
const browser = await puppeteer.launch({ executablePath: chrome, headless: true });
try {
  await parity(browser);
  const errors = await game(browser);
  errors.length === 0 ? ok("console clean") : fail("console:\n  " + errors.join("\n  "));
} finally {
  await browser.close();
  server.kill();
}
console.log(failures === 0 ? "AUDIO CHECK PASS" : `AUDIO CHECK FAIL (${failures})`);
process.exit(failures === 0 ? 0 : 1);
