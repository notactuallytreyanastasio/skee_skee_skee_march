// Real run to the counter: buy a specialty ball and a board edit, apply the edit, arm the ball next round, charm sell.
import { launch, open, PHONE, DESK, sleep } from "../lib.mjs";
const url = "http://127.0.0.1:8161/"; const which = process.argv[2] || "phone"; const vp = which === "phone" ? PHONE : DESK;
const D = "/Users/bobdawg/code/skee_skee_skee_march/tools/playtest/r2/shots";
const card = (t) => (t.match(/([A-Z][A-Z0-9 !',.?]{4,}) SKIP/) || [])[1] || "-";
const b = await launch(); const g = await open(b, url, vp, { "skee.arrivalDone": "true", "skee.walkthroughDone": "true" });
const S = (w) => g.shot(`${D}/sp-${which}-${w}.png`);
const tix = (t) => +(t.match(/PRIZE COUNTER (\d+)/)?.[1] ?? -1);
await g.press("TapStart");
let phase = "toCounter", armed = false, counters = 0;
for (let i = 0; i < 1500; i++) {
  let m = await g.marks();
  if (m.live.includes("TapGotIt")) { console.log("  card " + card(m.text)); await g.press("TapGotIt"); continue; }
  if (m.live.includes("TapNewRun")) { console.log("GAME OVER " + m.text.slice(-200)); await S("gameover"); break; }
  if (m.live.includes("TapLeaveCounter")) {
    counters++;
    console.log(`COUNTER#${counters} tix ${tix(m.text)} live ${m.live}`); await S(`counter${counters}`);
    // reroll until a specialty ball (offer 3) is affordable, buy it
    let t0 = tix(m.text);
    if (m.live.includes("TapBuyOffer(3)")) { await g.press("TapBuyOffer(3)"); m = await g.marks(); console.log(`  ball bought: tix ${t0} -> ${tix(m.text)}`); }
    const sel = m.live.find((x) => x.startsWith("TapSelectOffer(Some"));
    if (sel) {
      await g.press(sel); m = await g.marks(); console.log("  selected edit; live " + m.live.filter((x)=>!/Offer|Reroll|Leave|Guide|NewGame/.test(x))); await S(`edit-selected${counters}`);
      const before = tix(m.text);
      // tap a ring on the board: find the board on screen around the 30 ring
      const crease = m.crease; for (const fy of [0.6, 0.55, 0.5, 0.45, 0.4, 0.65, 0.35]) { await g.tap(vp.width / 2, crease * fy); m = await g.marks(); if (tix(m.text) !== before) { console.log(`  edit applied by tapping y=${fy}: tix ${before} -> ${tix(m.text)}`); break; } }
      await sleep(500); await S(`edit-applied${counters}`);
    }
    for (let k = 0; k < 3; k++) { const mm = await g.marks(); if (mm.live.includes("TapGotIt")) { console.log("  card " + card(mm.text)); await g.press("TapGotIt"); } }
    m = await g.marks();
    // sell a charm? tap charm 0 if owned
    if (m.live.includes("TapCharm(0)")) { await g.press("TapCharm(0)"); const mm = await g.marks(); console.log("  charm tapped; live " + mm.live.filter((x) => /Charm|Sell/.test(x)) + " | " + mm.text.match(/SELL[^]{0,40}/)?.[0]); await S(`charm${counters}`); await g.press("TapCharm(0)"); }
    await g.press("TapLeaveCounter"); if (counters >= 3) break; continue;
  }
  if (m.busy === "1") { await sleep(80); continue; }
  const arm = m.live.find((x) => x.startsWith("TapArm"));
  if (arm && !armed && m.can === "1") { await g.press(arm); const mm = await g.marks(); console.log(`  armed ${arm}: live ${mm.live.filter((x)=>/Arm/.test(x))} | ${mm.text.match(/FRAME[^]{0,120}/)?.[0]}`); await S("armed"); armed = true; await g.flick({ gap: 13 }); await sleep(150); await g.settle(); const m3 = await g.marks(); console.log(`  after armed throw: arms ${m3.live.filter((x)=>/Arm/.test(x))} | ${m3.text.match(/FRAME[^]{0,160}/)?.[0]}`); await S("armed-thrown"); continue; }
  if (m.can === "1") { await g.flick({ gap: 13, xoff: [0, 0, -12, 12][i % 4] }); await sleep(120); await g.settle(); continue; }
  if (m.live.includes("TapPull")) { await g.press("TapPull"); continue; }
  await sleep(100);
}
console.log("errors " + JSON.stringify(g.errors)); await b.close();
