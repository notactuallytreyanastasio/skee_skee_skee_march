// arcade_worklet.mjs: the AudioWorkletProcessor around
// Arcade.Web.SynthHost.serve, for a game's audio worklet build. Runs in the
// AudioWorkletGlobalScope: sampleRate, currentFrame, registerProcessor.
// Commands come in on the port as March lists of Arcade.SynthFeed.AudioCmd
// (structured clones of March's plain-object values), or as
// processorOptions.cmds before the first block. A new processor starts from
// a silent synth (reset: Arcade.Web.SynthHost.reset); each quantum takes what
// has arrived, renders one block and copies it into the mono output.
// processor: the name to register under (the game's main build asks
// Arcade.Web.Audio for the same one); rate: the synth's sample rate.
import { makePump, joinBatches } from "./arcade_synth_cell.mjs";

export function worklet_register(processor, rate, reset, serve) {
  class ArcadeSynthProcessor extends AudioWorkletProcessor {
    constructor(options) {
      super();
      reset._0(reset, 0);
      this.pending = [];
      this.applied = 0;
      const first = options && options.processorOptions && options.processorOptions.cmds;
      if (first) this.pending.push(first);
      this.port.onmessage = (e) => { this.pending.push(e.data); };
      this.pump = makePump(serve, rate, sampleRate, () => {
        const batches = this.pending;
        if (batches.length === 0) return { $: "Nil" };
        this.pending = [];
        this.applied += batches.length;
        return joinBatches(batches);
      });
      this.peak = 0;
      this.blocks = 0;
    }
    process(_inputs, outputs) {
      const out = outputs[0] && outputs[0][0];
      if (!out) return true;
      const before = this.applied;
      this.pump(out);
      for (let i = 0; i < out.length; i++) { const v = Math.abs(out[i]); if (v > this.peak) this.peak = v; }
      this.blocks++;
      // What the shell's timeline reads: when each batch reached the synth
      // (in audio frames), and every 2^9 quanta (about 1.5 s) the peak level.
      if (this.applied !== before) this.port.postMessage({ applied: this.applied - before, frame: currentFrame });
      if ((this.blocks & 511) === 0) { this.port.postMessage({ peak: this.peak, frame: currentFrame }); this.peak = 0; }
      return true;
    }
  }
  registerProcessor(processor, ArcadeSynthProcessor);
}
