import { launch, open, PHONE, sleep } from "../lib.mjs";
const b = await launch(); const g = await open(b, "http://127.0.0.1:8161/", (process.argv[2]==="desktop"?(await import("../lib.mjs")).DESK:PHONE), { "skee.arrivalDone": "true", "skee.walkthroughDone": "true" });
const tix = (t) => +(t.match(/PRIZE COUNTER (\d+)/)?.[1] ?? -1);
await g.press("TapStart");
for (let i = 0; i < 800; i++) {
  let m = await g.marks();
  if (m.live.includes("TapGotIt")) { await g.press("TapGotIt"); continue; }
  if (m.live.includes("TapNewRun")) { console.log("lost before counter"); break; }
  if (m.live.includes("TapLeaveCounter")) {
    const price = +(m.text.match(/PRIZE COUNTER \d+ \S+ [^]*? (\d+) TIX/)?.[1]);
    const t0 = tix(m.text); await g.press("TapBuyOffer(0)"); for (let k = 0; k < 3; k++) { const mm = await g.marks(); if (mm.live.includes("TapGotIt")) await g.press("TapGotIt"); }
    m = await g.marks(); const t1 = tix(m.text); console.log(`bought charm price ${price}: ${t0} -> ${t1}`);
    const hit = await g.page.evaluate(() => { const e = document.querySelector('#hud [data-intent="TapCharm(0)"]'); const r = e.getBoundingClientRect(); const x = r.x + r.width / 2, y = r.y + r.height / 2; const top = document.elementFromPoint(x, y); return { rect: [r.x, r.y, r.width, r.height].map(Math.round), topIsCharm: e.contains(top), top: top.className + " " + (top.closest("[data-intent]")?.dataset.intent || "") }; }); console.log("charm hit test " + JSON.stringify(hit));
    await g.press("TapCharm(0)"); m = await g.marks(); console.log("selected: " + m.text.match(/SELL[^]{0,30}|TAP AGAIN[^]{0,30}/)?.[0] + " tix " + tix(m.text));
    await g.shot("/Users/bobdawg/code/skee_skee_skee_march/tools/playtest/r2/shots/sell-selected.png");
    await g.press("TapCharm(0)"); m = await g.marks(); console.log(`sold: tix ${tix(m.text)} (expected ${t1 + Math.floor(price / 2)}) charms ${m.live.filter((x) => /Charm/.test(x))}`);
    break;
  }
  if (m.busy === "1") { await sleep(80); continue; }
  if (m.can === "1") { await g.flick({ gap: 13 }); await sleep(120); await g.settle(); continue; }
  if (m.live.includes("TapPull")) { await g.press("TapPull"); continue; }
  await sleep(100);
}
console.log("errors " + JSON.stringify(g.errors)); await b.close();
