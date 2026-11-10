// arcade_synth_cell.mjs: the synth's cell and the pump that copies its samples
// into the device's buffers. Imported by a game's audio worklet build (in the
// AudioWorkletGlobalScope) and by its main build (the ScriptProcessor
// fallback), each in its own realm, so each has its own cell. No game logic:
// Arcade.Web.SynthHost decides everything.
// Values cross in March's JS shapes: lists as { $: "Cons", _0, _1 } / Nil,
// closures called as f._0(f, args...).

const NIL = { $: "Nil" };

let synth = null;
export function synth_cell_get() { return synth; }
export function synth_cell_put(s) { synth = s; }

// The commands that arrived since the last block: March lists, oldest
// first, joined into one list for the next serve call.
export function joinBatches(batches) {
  if (batches.length === 0) return NIL;
  if (batches.length === 1) return batches[0];
  const all = [];
  for (const l of batches) for (let n = l; n && n.$ === "Cons"; n = n._1) all.push(n._0);
  let out = NIL;
  for (let i = all.length - 1; i >= 0; i--) out = { $: "Cons", _0: all[i], _1: out };
  return out;
}

// A pump fills a Float32Array from `serve` (Arcade.Web.SynthHost.serve:
// commands in, one 128-sample block out), rendered at `rate` (the synth's,
// Arcade.Synth.rate()). `take()` hands over the commands waiting since
// the last serve call. At the synth's own rate it copies samples one for
// one, so a 128-frame worklet quantum is exactly one block and a command
// applies at the first sample of the block after it arrives, as a lock
// around the synth would. At any other device rate it resamples linearly
// (the browser would otherwise play the synth sharp or flat).
export function makePump(serve, rate, outRate, take) {
  let cur = NIL;
  const next = () => {
    if (cur.$ !== "Cons") cur = serve._0(serve, take());
    const x = cur._0;
    cur = cur._1;
    return x;
  };
  if (outRate === rate) {
    return (out) => { for (let i = 0; i < out.length; i++) out[i] = next(); };
  }
  const step = rate / outRate;
  let a = null, b = 0, frac = 0;
  return (out) => {
    if (a === null) { a = next(); b = next(); }
    for (let i = 0; i < out.length; i++) {
      out[i] = a + (b - a) * frac;
      frac += step;
      while (frac >= 1) { frac -= 1; a = b; b = next(); }
    }
  };
}
