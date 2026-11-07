// Walkthrough with good flicks to the counter, then a board edit (stamp) on a hole;
// and a walkthrough lost on purpose (practice failure flow).
import { launch, open, sleep, PHONE, DESK } from "./lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8161/";
const vp = process.argv[3] === "desktop" ? DESK : PHONE;
const dir = new URL("./shots/func2/", import.meta.url).pathname;
const b = await launch();
async function walk(g, fl) {
  await g.press("TapStart");
  for (let i = 0; i < 300; i++) {
    const m = await g.marks();
    if (m.live.includes("TapLeaveCounter")) return "counter";
    if (/GAME OVER/.test(m.text) && !m.live.includes("TapGotIt")) return "over";
    if (m.layer === "LayerArrival") { await g.press("TapArrivalNext"); continue; }
    if (m.layer === "LayerHost") { await g.press("TapCloseHost"); continue; }
    if (m.live.includes("TapGotIt")) { console.log("  card " + (m.text.match(/([A-Z][A-Z !',.?]{5,}) SKIP/)?.[1])); await g.press("TapGotIt"); continue; }
    if (m.busy === "1") { await sleep(80); continue; }
    if (m.can === "1") { await g.flick(fl(i)); await sleep(120); await g.settle(); continue; }
    if (m.live.includes("TapPull")) { await g.press("TapPull"); continue; }
    await sleep(100);
  }
  return "stuck";
}
{
  console.log("=== stamp");
  for (let attempt = 0; attempt < 3; attempt++) {
    const g = await open(b, url, vp, { "skee.arrivalDone": "true" });
    const r = await walk(g, (i) => ({ gap: 13, xoff: [0, -20, 20][i % 3] }));
    let m = await g.marks();
    console.log("walk ended: " + r + " | " + m.text.slice(0, 260));
    const sel = m.live.find((x) => x.startsWith("TapSelectOffer(Some"));
    if (!sel) { console.log("no board edit offered: " + JSON.stringify(m.live)); await g.page.close(); continue; }
    await g.press(sel);
    await g.shot(dir + `stamp-selected-${vp.width}.png`);
    const before = m.text.match(/PRIZE COUNTER (\d+)/)?.[1];
    // A hole visible under the high coach card: the 10/20/30 holes at the board's foot.
    let ok = false;
    for (const fy of [0.36, 0.34, 0.32, 0.30]) {
      await g.tap(vp.width / 2, vp.height * fy);
      m = await g.marks();
      const now = m.text.match(/PRIZE COUNTER (\d+)/)?.[1];
      console.log(`  tap (${vp.width / 2},${(vp.height * fy).toFixed(0)}) tickets ${before} -> ${now}; selecting=${/tap a hole/.test(m.text)}`);
      if (now !== before) { ok = true; break; }
    }
    await sleep(500);
    await g.shot(dir + `stamp-applied-${vp.width}.png`);
    console.log("stamp applied: " + ok + " | " + m.text.slice(0, 300));
    console.log("errors " + JSON.stringify(g.errors));
    await g.page.close();
    break;
  }
}
{
  console.log("=== practice lost");
  const g = await open(b, url, vp, { "skee.arrivalDone": "true" });
  const r = await walk(g, () => ({ gap: 6, steps: 5 }));  // power 1: overshoots
  let m = await g.marks();
  console.log("walk ended: " + r + " | " + m.text.slice(0, 300) + " live " + JSON.stringify(m.live));
  await g.shot(dir + `practice-lost-${vp.width}.png`);
  for (let i = 0; i < 4 && m.live.includes("TapGotIt"); i++) { await g.press("TapGotIt"); m = await g.marks(); }
  console.log("after: " + m.text.slice(0, 200));
  const w = await g.page.evaluate(() => localStorage.getItem("skee.wallet"));
  console.log("wallet " + w);
  console.log("errors " + JSON.stringify(g.errors));
}
await b.close();
