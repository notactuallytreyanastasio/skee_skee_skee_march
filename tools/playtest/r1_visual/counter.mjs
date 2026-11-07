// Walkthrough to the prize counter, buy, check text fit, leave, next round; then the title prize shop.
import { launch, open, shot, marks, text, sleep, press, flick, waitFor, PHONE, DESK } from "./lib.mjs";
const which = process.argv[2] || "phone";
const vp = which === "phone" ? PHONE : DESK, touch = which === "phone";
const b = await launch();
const { page, log } = await open(b, vp);
const hud = async () => (await text(page)).replace(/^BAR 7 /, "");
await press(page, "TapStart", touch);
let atCounter = false;
for (let g = 0; g < 80 && !atCounter; g++) {
  const m = await marks(page);
  if (m.live.includes("TapLeaveCounter")) { atCounter = true; break; }
  if (m.live.includes("TapArrivalNext")) { await press(page, "TapArrivalNext", touch); continue; }
  if (m.live.includes("TapCloseHost")) { await press(page, "TapCloseHost", touch); continue; }
  if (m.live.includes("TapGotIt")) { await press(page, "TapGotIt", touch); continue; }
  if (m.live.includes("TapPull") && m.busy === "0") { await press(page, "TapPull", touch); await waitFor(page, (m) => m.busy === "0", "reels", 15000); continue; }
  if (m.canThrow === "1" && m.busy === "0") { const x = vp.width / 2; await flick(page, touch, x, vp.height - 60, x, m.crease + 10, 5, 10); await sleep(100); await waitFor(page, (m) => m.busy === "0", "settle", 25000); continue; }
  await sleep(200);
}
await sleep(1500);
console.log("counter: " + (await shot(page, `${which}-c1-counter`)));
const fit = async () => page.evaluate(() => [...document.querySelectorAll("#hud *")].filter((e) => e.children.length === 0 && e.textContent.trim() && (e.scrollHeight > e.clientHeight + 1 || e.scrollWidth > e.clientWidth + 1) && getComputedStyle(e).overflow !== "visible").map((e) => `${e.textContent.trim().slice(0, 60)} [${e.scrollWidth}x${e.scrollHeight} in ${e.clientWidth}x${e.clientHeight}] lines~${Math.round(e.clientHeight / parseFloat(getComputedStyle(e).lineHeight))} font ${getComputedStyle(e).fontSize}/${getComputedStyle(e).lineHeight}`));
console.log("CLIPPED TEXT:\n  " + (await fit()).join("\n  "));
console.log(await hud());
// dismiss the coach card if any, then buy
let m = await marks(page);
if (m.live.includes("TapGotIt")) await press(page, "TapGotIt", touch);
m = await marks(page); console.log("live " + m.live.join(","));
const tix = async () => page.evaluate(() => document.getElementById("hud").innerText.match(/PRIZE COUNTER\s+(\d+)/)?.[1]);
const t0 = await tix();
const buy = m.live.find((x) => x.startsWith("TapBuyOffer"));
await press(page, buy, touch); await sleep(600);
console.log(`bought ${buy}: tickets ${t0} -> ${await tix()}`);
console.log("after buy: " + (await shot(page, `${which}-c2-bought`)));
m = await marks(page); console.log("live " + m.live.join(","));
const sel = m.live.find((x) => x.startsWith("TapSelectOffer(Some"));
if (sel) { await press(page, sel, touch); await sleep(500); console.log("selected stamp: " + (await shot(page, `${which}-c3-stamp`))); m = await marks(page); console.log("live " + m.live.join(",") + " | " + (await hud()).slice(-300)); }
if (sel) {
  // tap the visible 10 hole, centre bottom of the board
  const pt = which === "phone" ? [195, 307] : null;
  const pos = pt || await page.evaluate(() => [innerWidth / 2, 0]);
  if (!pt) { console.log("desk: skip hole tap"); }
  else { if (touch) await page.touchscreen.tap(pt[0], pt[1]); else await page.mouse.click(pt[0], pt[1]); await sleep(700);
    console.log("tapped hole: tickets " + (await tix()) + " " + (await shot(page, `${which}-c4-stamped`))); m = await marks(page); console.log("live " + m.live.join(",")); }
}
const hole = m.live.find((x) => /Stamp|Hole|Apply/.test(x));
if (hole) { await press(page, hole, touch); await sleep(400); console.log("stamped " + hole + ": " + (await shot(page, `${which}-c4-stamped`))); m = await marks(page); console.log("live " + m.live.join(",")); }
if (m.live.includes("TapGotIt")) await press(page, "TapGotIt", touch);
m = await marks(page);
if (m.live.includes("TapLeaveCounter")) { await press(page, "TapLeaveCounter", touch); await sleep(800); console.log("next round: " + (await shot(page, `${which}-c5-next-round`))); console.log((await hud()).slice(0, 300)); }
m = await marks(page); console.log("marks " + JSON.stringify(m));
console.log(log.filter((l) => !/^(log|debug|info)/.test(l)).join("\n"));
await b.close();
