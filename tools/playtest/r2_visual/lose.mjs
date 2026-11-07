// Lose a run as a player (leave the counter without buying), then the game-over card, the prize shop, buy, back, new run.
import { launch, open, shot, marks, text, sleep, press, flick, waitFor, PHONE, DESK } from "./lib.mjs";
const which = process.argv[2] || "phone"; const vp = which === "phone" ? PHONE : DESK, touch = which === "phone";
const b = await launch(); const { page, log } = await open(b, vp);
await press(page, "TapStart", touch);
for (let i = 0; i < 8; i++) { const m = await marks(page); if (m.live.includes("TapArrivalNext")) await press(page, "TapArrivalNext", touch); }
await press(page, "TapCloseHost", touch); await press(page, "TapSkipWalkthrough", touch); await sleep(300);
let throws = 0;
for (let g = 0; g < 400; g++) {
  const m = await marks(page);
  if (m.live.includes("TapNewRun")) break;
  if (m.live.includes("TapGotIt")) { await press(page, "TapGotIt", touch); continue; }
  if (m.live.includes("TapLeaveCounter")) { console.log("counter: " + (await text(page)).match(/ANTE \S+ [A-Z\- ]+ \d+ \/ \d+/)?.[0]); await press(page, "TapLeaveCounter", touch); await sleep(500); continue; }
  if (m.layer !== "LayerBase") { console.log("layer " + m.layer + " " + m.live); const nx = m.live[0]; if (nx) await press(page, nx, touch); else await sleep(300); continue; }
  if (m.live.includes("TapPull") && m.busy === "0") { await press(page, "TapPull", touch); await waitFor(page, (m) => m.busy === "0", "reels", 15000); continue; }
  if (m.canThrow === "1" && m.busy === "0") {
    throws++; const x = vp.width / 2, y0 = vp.height - 60;
    // alternate: angled hard (rail/gutter), plain medium
    const dx = throws % 2 ? 140 : -10;
    await flick(page, touch, x, y0, x + dx, m.crease + 20, 7, 14);
    await sleep(200); await waitFor(page, (m) => m.busy === "0", "settle", 25000); continue;
  }
  await sleep(150);
}
console.log("throws " + throws);
await sleep(1200);
console.log("over: " + (await shot(page, `${which}-L1-over`)) + "\n  " + (await text(page)).slice(-250));
let m = await marks(page); console.log("live " + m.live.join(","));
await press(page, "TapOpenShop", touch); await sleep(500);
console.log("shop: " + (await shot(page, `${which}-L2-shop`)) + "\n  " + (await text(page)).slice(-600));
m = await marks(page); console.log("live " + m.live.join(","));
const buy = m.live.find((x) => /Prize|Buy/.test(x));
if (buy) { await press(page, buy, touch); await sleep(600); console.log("bought " + buy + ": " + (await shot(page, `${which}-L3-bought`)) + "\n  " + (await text(page)).slice(-600)); m = await marks(page); console.log("live " + m.live.join(",")); }
const close = m.live.find((x) => /Close|Back/.test(x)); if (close) await press(page, close, touch); await sleep(400);
m = await marks(page); console.log("after shop: " + m.live.join(",") + " " + (await shot(page, `${which}-L4-aftershop`)));
if (m.live.includes("TapNewRun")) { await press(page, "TapNewRun", touch); await sleep(900); console.log("new run: " + (await shot(page, `${which}-L5-newrun`)) + " " + JSON.stringify(await marks(page))); }
await page.reload({ waitUntil: "load" }); await sleep(900); console.log("reload: " + JSON.stringify(await marks(page)) + " " + (await shot(page, `${which}-L6-reload`)));
console.log(log.filter((l) => !/^(log|debug|info)/.test(l)).join("\n") || "console clean");
await b.close();
