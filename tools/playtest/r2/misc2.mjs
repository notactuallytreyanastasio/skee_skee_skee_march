import { launch, open, PHONE, sleep } from "../lib.mjs";
const url = "http://127.0.0.1:8161/"; const D = "/Users/bobdawg/code/skee_skee_skee_march/tools/playtest/r2/shots";
const card = (t) => (t.match(/([A-Z][A-Z0-9 !',.?]{4,}) SKIP/) || [])[1] || "-";
const sum = (m) => (m.text.match(/ANTE[^]*?\d+ \/ \d+ \d+/)?.[0] || "") + " | " + (m.text.match(/FRAME \d\/\d · \d+ BALLS/)?.[0] || "");
const b = await launch();
const g = await open(b, url, PHONE, { "skee.arrivalDone": "true", "skee.walkthroughDone": "true" });
const reload = async () => { await g.page.reload(); await g.page.waitForFunction(() => document.documentElement.getAttribute("data-layer")); await sleep(900); return g.marks(); };
const ready = async () => { for (let i = 0; i < 150; i++) { const m = await g.marks(); if (m.live.includes("TapGotIt")) { await g.press("TapGotIt"); continue; } if (m.can === "1" && m.busy === "0") return m; if (m.live.includes("TapPull")) await g.press("TapPull"); await sleep(80); } };
await g.press("TapStart"); await ready();
await g.flick({ gap: 13 }); await sleep(150); await g.settle(); await ready();
let m = await g.marks(); const base = sum(m); console.log("run: " + base);
// pointer cancel mid-drag
const cdp = g.cdp; const x = 195, y0 = m.crease + 250;
await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y: y0, id: 1 }] });
for (let k = 1; k <= 4; k++) { await sleep(14); await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y0 - 30 * k, id: 1 }] }); }
await cdp.send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] }); await sleep(600);
m = await g.marks(); console.log("after touchCancel: busy " + m.busy + " can " + m.can + " | " + sum(m) + " unchanged=" + (sum(m) === base));
await g.shot(D + "/m2-cancel.png");
// second finger lands during a flick
await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y: y0, id: 1 }] });
await sleep(14); await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y0 - 60, id: 1 }] });
await sleep(14); await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y: y0 - 120, id: 1 }, { x: 80, y: 700, id: 2 }] });
for (let k = 2; k <= 6; k++) { await sleep(14); await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y0 - 60 * k, id: 1 }, { x: 80 + 10 * k, y: 700, id: 2 }] }); }
await sleep(4); await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await sleep(200);
m = await g.marks(); console.log("two-finger flick: busy " + m.busy); await g.settle(); m = await g.marks(); console.log("  -> " + sum(m) + " launch " + JSON.stringify(await g.lastLaunch()));
await ready();
// hidden during roll
await g.flick({ gap: 13 }); await sleep(200);
await g.page.evaluate(() => { Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true }); Object.defineProperty(document, "hidden", { value: true, configurable: true }); document.dispatchEvent(new Event("visibilitychange")); });
await sleep(1500);
await g.page.evaluate(() => { Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true }); Object.defineProperty(document, "hidden", { value: false, configurable: true }); document.dispatchEvent(new Event("visibilitychange")); });
const s = await g.settle(); m = await g.marks(); console.log("hidden mid-roll then visible: settled " + !!s + " | " + sum(m));
await ready(); m = await g.marks(); const before = sum(m);
// replay lesson mid-run, reload during it, then skip
await g.press("TapOpenGuide"); await g.press("TapReplayLesson"); await sleep(300);
m = await g.marks(); console.log("replay lesson: layer " + m.layer + " card " + card(m.text) + " | " + sum(m)); await g.shot(D + "/m2-replay.png");
m = await reload(); console.log("reload during replayed lesson: layer " + m.layer + " live " + m.live + " | " + sum(m) + " same-as-before=" + (sum(m) === before)); await g.shot(D + "/m2-replay-reload.png");
if (m.live.includes("TapSkipWalkthrough")) { await g.press("TapSkipWalkthrough"); m = await g.marks(); console.log("after skip: " + sum(m) + " restored=" + (sum(m) === before)); }
else { await g.press("TapOpenGuide"); await g.press("TapReplayLesson"); await sleep(200); await g.press("TapSkipWalkthrough"); m = await g.marks(); console.log("replay then skip: " + sum(m) + " restored=" + (sum(m) === before)); }
console.log("errors " + JSON.stringify(g.errors)); await b.close();
