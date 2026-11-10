// Round 2: follow the walkthrough like a new player, lever dragged, flicks varied.
import { launch, open, PHONE, DESK, sleep } from "../lib.mjs";
const url = "http://127.0.0.1:8161/";
const which = process.argv[2] || "phone";
const vp = which === "phone" ? PHONE : DESK;
const D = "/Users/bobdawg/code/skee_skee_skee_march/tools/playtest/r2/shots";
import { mkdirSync } from "node:fs"; mkdirSync(D, { recursive: true });
const b = await launch();
const g = await open(b, url, vp, {});
let n = 0; const shot = (w) => g.shot(`${D}/walk-${which}-${String(++n).padStart(2, "0")}-${w}.png`);
const card = (t) => (t.match(/([A-Z][A-Z0-9 !',.?]{4,}) SKIP/) || [])[1] || "-";
async function lever() {
  const r = await g.page.evaluate(() => { const b = document.querySelector('#hud .lever [data-drag]'); const t = document.querySelector('#hud .lever-track'); if (!b || !t) return null; const rb = b.getBoundingClientRect(); const rt = t.getBoundingClientRect(); return { x: rb.x + rb.width / 2, y: rb.y + rb.height / 2, bot: rt.bottom }; });
  if (!r) { console.log("  no lever knob, tapping SPIN"); return g.press("TapPull"); }
  const pts = []; for (let i = 0; i <= 10; i++) pts.push([r.x, r.y + (r.bot - 5 - r.y) * i / 10]);
  if (g.touch) { await g.page.touchscreen.touchStart(...pts[0]); for (const p of pts.slice(1)) { await sleep(18); await g.page.touchscreen.touchMove(...p); } await g.page.touchscreen.touchEnd(); }
  else { await g.page.mouse.move(...pts[0]); await g.page.mouse.down(); for (const p of pts.slice(1)) { await sleep(18); await g.page.mouse.move(...p); } await g.page.mouse.up(); }
  await sleep(250);
}
const flicks = [{}, { gap: 18 }, { gap: 10, steps: 6 }, { xoff: 30, dx: -20 }, { xoff: -30, dx: 25, gap: 14 }, { gap: 22, steps: 10 }, { gap: 12 }];
let fi = 0, lastCard = "", lastLayer = "";
for (let i = 0; i < 400; i++) {
  const m = await g.marks();
  const c = card(m.text);
  if (c !== lastCard || m.layer !== lastLayer) { console.log(`[${i}] layer=${m.layer} card=${c} live=${m.live.filter((x) => !x.startsWith("Topic")).join(",")}`); console.log("    " + m.text.slice(0, 260)); lastCard = c; lastLayer = m.layer; await shot(c.replace(/\W+/g, "_").slice(0, 20)); }
  if (m.live.includes("TapArrivalNext")) { await g.press("TapArrivalNext"); continue; }
  if (m.live.includes("TapCloseHost")) { await g.press("TapCloseHost"); continue; }
  if (m.live.includes("TapGotIt")) { await g.press("TapGotIt"); continue; }
  if (m.live.includes("TapStart") && i < 3) { await g.press("TapStart"); continue; }
  if (m.live.includes("TapLeaveCounter")) {
    console.log("COUNTER text: " + m.text.slice(0, 500)); await shot("counter");
    const buy = m.live.find((x) => x.startsWith("TapBuyOffer")); if (buy) { await g.press(buy); const m2 = await g.marks(); console.log("  bought " + buy + " -> " + m2.text.slice(0, 200)); await shot("bought"); }
    for (let k = 0; k < 3; k++) { const mm = await g.marks(); if (mm.live.includes("TapGotIt")) { console.log("  card " + card(mm.text)); await g.press("TapGotIt"); } }
    await g.press("TapLeaveCounter"); continue;
  }
  if (m.busy === "1") { await sleep(80); continue; }
  if (m.can === "1") { const f = flicks[fi++ % flicks.length]; await g.flick(f); await sleep(150); const s = await g.settle(); const L = await g.lastLaunch(); const mm = await g.marks(); console.log(`  flick ${JSON.stringify(f)} launch=${JSON.stringify(L)} -> ${mm.text.match(/ANTE[^]*?\d+ \/ \d+/)?.[0]} | ${mm.text.slice(0,0)}`); continue; }
  if (m.live.includes("TapPull")) { await lever(); continue; }
  if (/GAME OVER/.test(m.text)) { console.log("GAME OVER"); break; }
  if (i > 5 && m.layer === "LayerBase" && m.live.includes("TapStart")) { console.log("back at title"); break; }
  await sleep(100);
  if (fi > 14) break;
}
await shot("end");
const ls = await g.page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k).slice(0, 200)])));
console.log("storage", JSON.stringify(ls, null, 1));
console.log("errors", g.errors);
await b.close();
