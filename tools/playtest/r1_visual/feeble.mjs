import { launch, open, shot, marks, text, sleep, press, flick, waitFor, PHONE } from "./lib.mjs";
const b = await launch(); const { page } = await open(b, PHONE); const touch = true;
await press(page, "TapStart", touch);
for (let i = 0; i < 8; i++) { const m = await marks(page); if (m.live.includes("TapArrivalNext")) await press(page, "TapArrivalNext", touch); }
await press(page, "TapCloseHost", touch); await press(page, "TapSkipWalkthrough", touch); await sleep(300);
await press(page, "TapPull", touch); await waitFor(page, (m) => m.busy === "0", "reels", 15000);
await page.evaluate(() => { window.__pe = []; for (const k of ["pointerdown", "pointermove", "pointerup"]) addEventListener(k, (e) => window.__pe.push(k[7] + Math.round(e.clientY)), true); });
for (const [name, steps, gap, above] of [["feeble", 6, 60, 250], ["feeble-b", 6, 60, 250], ["slow-short", 8, 40, 200]]) {
  const m = await marks(page); const x = 195, y0 = 844 - 60;
  await flick(page, touch, x, y0, x, m.crease + above, steps, gap); await sleep(60);
  const t = (await marks(page)).canThrow === "0";
  console.log(name + " thrown=" + t + " events " + (await page.evaluate(() => window.__pe.splice(0).join(" "))));
  if (t) await waitFor(page, (m) => m.busy === "0" && m.canThrow === "1", "settle", 25000);
}
await b.close();
