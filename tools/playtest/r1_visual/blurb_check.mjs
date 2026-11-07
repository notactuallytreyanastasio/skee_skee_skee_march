// The prize counter's offer blurbs: does each one fit in its box? (fixer, round 1)
import { launch, open, shot, marks, sleep, press, flick, waitFor, PHONE, DESK } from "./lib.mjs";
const which = process.argv[2] || "phone";
const vp = which === "phone" ? PHONE : DESK, touch = which === "phone";
const b = await launch();
const { page, log } = await open(b, vp);
await press(page, "TapStart", touch);
for (let g = 0; g < 80; g++) {
  const m = await marks(page);
  if (m.live.includes("TapLeaveCounter")) break;
  if (m.live.includes("TapArrivalNext")) { await press(page, "TapArrivalNext", touch); continue; }
  if (m.live.includes("TapCloseHost")) { await press(page, "TapCloseHost", touch); continue; }
  if (m.live.includes("TapGotIt")) { await press(page, "TapGotIt", touch); continue; }
  if (m.live.includes("TapPull") && m.busy === "0") { await press(page, "TapPull", touch); await waitFor(page, (m) => m.busy === "0", "reels", 15000); continue; }
  if (m.canThrow === "1" && m.busy === "0") { const x = vp.width / 2; await flick(page, touch, x, vp.height - 60, x, m.crease + 10, 5, 10); await sleep(100); await waitFor(page, (m) => m.busy === "0", "settle", 25000); continue; }
  await sleep(200);
}
await sleep(1200);
const rows = await page.evaluate(() => [...document.querySelectorAll("#hud .offer-blurb")].map((e) => {
  const s = getComputedStyle(e), r = e.getBoundingClientRect();
  return { text: e.textContent, box: [Math.round(r.width), Math.round(r.height)], scrollH: e.scrollHeight, clientH: e.clientHeight, font: s.fontSize + "/" + s.lineHeight,
    clipped: e.scrollHeight > e.clientHeight + 1 };
}));
for (const r of rows) console.log(JSON.stringify(r));
console.log("shot " + (await shot(page, `${which}-fix-blurb`)));
console.log(log.filter((l) => !/^(log|debug|info)/.test(l)).join("\n"));
await b.close();
