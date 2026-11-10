// The lever's knob: tap does not pull; a short drag springs back; a long drag pulls. (fixer, round 1)
import { launch, open, shot, marks, sleep, press, waitFor, PHONE, DESK } from "./lib.mjs";
const which = process.argv[2] || "phone";
const vp = which === "phone" ? PHONE : DESK, touch = which === "phone";
const b = await launch();
const { page, log } = await open(b, vp);
await press(page, "TapStart", touch);
for (let g = 0; g < 40; g++) {
  const m = await marks(page);
  if (m.live.includes("TapPull") && m.busy === "0" && m.layer === "LayerBase") break;
  if (m.live.includes("TapArrivalNext")) { await press(page, "TapArrivalNext", touch); continue; }
  if (m.live.includes("TapCloseHost")) { await press(page, "TapCloseHost", touch); continue; }
  if (m.live.includes("TapSkipWalkthrough")) { await press(page, "TapSkipWalkthrough", touch); continue; }
  if (m.live.includes("TapGotIt")) { await press(page, "TapGotIt", touch); continue; }
  await sleep(200);
}
await sleep(500);
const knob = async () => page.evaluate(() => { const k = document.querySelector("#hud .knob"); if (!k) return null; const r = k.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, t: k.style.transform }; });
const k0 = await knob();
console.log("knob at rest " + JSON.stringify(k0) + " marks " + JSON.stringify(await marks(page)));
async function drag(dy, ms, label) {
  const steps = 12, x = k0.x, y = k0.y, mid = [];
  if (touch) await page.touchscreen.touchStart(x, y); else { await page.mouse.move(x, y); await page.mouse.down(); }
  for (let i = 1; i <= steps; i++) {
    await sleep(ms / steps);
    if (touch) await page.touchscreen.touchMove(x, y + dy * i / steps); else await page.mouse.move(x, y + dy * i / steps);
    if (i === steps / 2 || i === steps) { await sleep(40); mid.push((await knob())?.t); }
  }
  await shot(page, `${which}-fix-${label}-held`);
  if (touch) await page.touchscreen.touchEnd(); else await page.mouse.up();
  const after = []; for (const t of [30, 80, 160, 700]) { await sleep(t - (after.length ? [30, 80, 160, 700][after.length - 1] : 0)); after.push((await knob())?.t); }
  const m = await marks(page);
  console.log(`${label}: during ${JSON.stringify(mid)} after ${JSON.stringify(after)} busy=${m.busy} pull-live=${m.live.includes("TapPull")}`);
}
// a plain tap
if (touch) await page.touchscreen.tap(k0.x, k0.y); else await page.mouse.click(k0.x, k0.y);
await sleep(300);
let m = await marks(page); console.log(`tap: busy=${m.busy} pull-live=${m.live.includes("TapPull")}`);
await drag(40, 350, "short");
await drag(200, 350, "long");
await waitFor(page, (m) => m.busy === "1", "spinning", 3000);
console.log("after long drag marks " + JSON.stringify(await marks(page)));
await shot(page, `${which}-fix-lever-pulled`);
console.log(log.filter((l) => !/^(log|debug|info)/.test(l)).join("\n") || "console clean");
await b.close();
