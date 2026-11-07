// The game screen (walkthrough skipped, after a pull) at several viewport sizes, plus a live resize.
import { launch, open, shot, marks, text, sleep, press, waitFor } from "./lib.mjs";
const b = await launch();
const sizes = [["se", { width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
  ["landscape", { width: 844, height: 390, deviceScaleFactor: 3, isMobile: true, hasTouch: true }],
  ["ipad", { width: 820, height: 1180, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
  ["fhd", { width: 1920, height: 1080, deviceScaleFactor: 1 }]];
for (const [n, vp] of sizes) {
  const { page, log } = await open(b, vp); const touch = !!vp.hasTouch;
  await shot(page, `size-${n}-title`);
  await press(page, "TapStart", touch);
  for (let i = 0; i < 8; i++) { const m = await marks(page); if (m.live.includes("TapArrivalNext")) await press(page, "TapArrivalNext", touch); }
  await press(page, "TapCloseHost", touch); await press(page, "TapSkipWalkthrough", touch); await sleep(300);
  await shot(page, `size-${n}-machine`);
  await press(page, "TapPull", touch); await waitFor(page, (m) => m.busy === "0", "reels", 15000); await sleep(300);
  const ov = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight, iw: innerWidth, ih: innerHeight }));
  console.log(n, JSON.stringify(ov), JSON.stringify(await marks(page)));
  await shot(page, `size-${n}-aim`);
  if (n === "fhd") { await page.setViewport({ width: 900, height: 900 }); await sleep(500); await shot(page, `size-${n}-resized900`); console.log("resized marks", JSON.stringify(await marks(page))); }
  console.log(log.filter((l) => !/^(log|debug|info)/.test(l)).join("\n"));
  await page.close();
}
await b.close();
