import { launch, open, PHONE, sleep } from "../lib.mjs";
const b = await launch();
for (const rate of [1, 4, 6]) {
  const g = await open(b, "http://127.0.0.1:8161/", PHONE, { "skee.arrivalDone": "true", "skee.walkthroughDone": "true" });
  await g.cdp.send("Emulation.setCPUThrottlingRate", { rate });
  await g.press("TapStart"); const out = [];
  for (let k = 0; k < 3; k++) {
    for (let i = 0; i < 150; i++) { const m = await g.marks(); if (m.live.includes("TapGotIt")) { await g.press("TapGotIt"); continue; } if (m.can === "1" && m.busy === "0") break; if (m.live.includes("TapPull")) await g.press("TapPull"); await sleep(80); }
    const t0 = Date.now(); await g.flick({ gap: 13 }); await sleep(100); await g.settle(); const L = await g.lastLaunch(); out.push(`${L?.power}/${L?.speed} ${Date.now() - t0}ms`);
  }
  console.log(`cpu x${rate}: ${out.join(" | ")} errors ${g.errors.length}`); await g.page.close();
}
await b.close();
