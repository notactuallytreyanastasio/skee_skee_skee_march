// The shipped audio worklet (dist/skee_synth_worklet.mjs, from make web) run
// under node with a stand-in AudioWorkletGlobalScope, against the real Swift
// Synth's golden samples: the processor, the pump and the March synth, with
// no browser. Also runs the resampling path (a 48000 Hz device) for sanity.
//   node tools/audio_check/worklet_node.mjs
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { scenarios, fromBits, bitsOf } from "./golden.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");

let Processor = null;
globalThis.sampleRate = 44100;
globalThis.currentFrame = 0;
globalThis.AudioWorkletProcessor = class { constructor() { this.port = { postMessage() { }, onmessage: null }; } };
globalThis.registerProcessor = (_name, cls) => { Processor = cls; };
await import(pathToFileURL(join(root, "dist", "skee_synth_worklet.mjs")).href);
if (!Processor) { console.log("FAIL the worklet registered no processor"); process.exit(1); }

function render(sound, len, rate) {
  globalThis.sampleRate = rate;
  const cmds = { $: "Cons", _0: { $: "CmdPlay", _0: sound }, _1: { $: "Nil" } };
  const p = new Processor({ processorOptions: { cmds } });
  const out = new Float32Array(Math.ceil(len / 128) * 128);
  for (let i = 0; i < out.length; i += 128) {
    const block = out.subarray(i, i + 128);
    p.process([], [[block]]);
  }
  return out;
}

const tol = Math.pow(2, -22);
let compared = 0, differ = 0, worst = 0, bad = 0;
const list = scenarios(root);
for (const s of list) {
  const got = render(s.sound, s.len, 44100);
  for (const [i, bits] of s.kept) {
    const err = Math.abs(got[i] - fromBits(bits));
    if (bitsOf(got[i]) !== bits) differ++;
    if (err > worst) worst = err;
    if (err > tol) bad++;
    compared++;
  }
}
const line = `${list.length} scenarios, ${compared} samples, ${differ} not bit-identical, worst |error| ${worst.toExponential(3)}`;
console.log((bad === 0 && compared > 0 ? "ok   " : "FAIL ") + "worklet under node: " + line);

// A 48 kHz device: the pump resamples. The jackpot must still sound, in range.
const r = render({ $: "SndJackpot" }, 48000, 48000);
let peak = 0; for (const x of r) peak = Math.max(peak, Math.abs(x));
const resampled = peak > 0.05 && peak <= 1;
console.log((resampled ? "ok   " : "FAIL ") + `resampled to 48000 Hz: peak ${peak.toFixed(4)}`);
process.exit(bad === 0 && compared > 0 && resampled ? 0 : 1);
