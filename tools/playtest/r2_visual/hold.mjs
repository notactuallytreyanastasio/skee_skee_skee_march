// Thumb down off-centre and hold: does the ball slide under the thumb and the dotted line move? Then flick up from there.
import { launch, open, shot, marks, text, sleep, press, waitFor, PHONE } from "./lib.mjs";
const b = await launch(); const { page } = await open(b, PHONE); const touch = true;
const cdp = await page.target().createCDPSession();
await press(page, "TapStart", touch);
for (let i = 0; i < 8; i++) { const m = await marks(page); if (m.live.includes("TapArrivalNext")) await press(page, "TapArrivalNext", touch); }
await press(page, "TapCloseHost", touch); await press(page, "TapSkipWalkthrough", touch); await sleep(300);
await press(page, "TapPull", touch); await waitFor(page, (m) => m.busy === "0", "reels", 15000);
console.log("ready: " + (await shot(page, "phone-h0-ready")));
const x = 270, y0 = 760;
await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y: y0 }] }); await sleep(400);
console.log("held: " + (await shot(page, "phone-h1-held")));
const m = await marks(page), D = (y0 - m.crease - 12) * 1.25, dt = 1 / 120, n = Math.round(0.24 / dt), cut = Math.round(n * .8);
const base = Date.now() / 1000 + 0.02, pos = (i) => { const u = i / n; return 10 * u ** 3 - 15 * u ** 4 + 6 * u ** 5; };
const wait = async (i) => { while (Date.now() / 1000 < base + i * dt) await new Promise((r) => setImmediate(r)); };
for (let i = 1; i <= cut; i++) { await wait(i); await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y0 - D * pos(i) }], timestamp: base + i * dt }); }
await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [], timestamp: base + cut * dt });
for (let k = 0; k < 4; k++) { await sleep(280); console.log("roll: " + (await shot(page, `phone-h2-roll${k}`))); }
await waitFor(page, (m) => m.busy === "0", "settle", 25000);
console.log("settled: " + (await shot(page, "phone-h3-settled")) + " " + (await text(page)).match(/(GUTTER|\+\d+)/g));
await b.close();
