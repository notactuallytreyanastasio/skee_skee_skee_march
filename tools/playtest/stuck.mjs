// Reproduce: after the "PICK YOUR BALL" tip (ante 2), can a flick still throw?
// Uses a saved run: replays the long run quickly by storing its run save.
import { launch, open, sleep, PHONE, DESK } from "./lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8161/";
const vp = process.argv[3] === "desktop" ? DESK : PHONE;
const dir = new URL("./shots/func2/", import.meta.url).pathname;
const b = await launch();
const g = await open(b, url, vp, { "skee.arrivalDone": "true", "skee.walkthroughDone": "true", "skee.tipsSeen": JSON.stringify(["combo","hotSpot","charm","specialty","boardEdit","boss","bets","fever","freeGames","jackpot","gameOver","balls"]) });
await g.press("TapStart");
for (let i = 0; i < 40; i++) { const m = await g.marks(); if (m.live.includes("TapPull")) { await g.press("TapPull"); break; } await sleep(100); }
await g.settle();
let m = await g.marks();
console.log("before: " + m.text.slice(0, 200)); console.log("live " + JSON.stringify(m.live));
await g.shot(dir + `stuck-${vp.width}-1.png`);
const hit = await g.page.evaluate((x, y) => { const e = document.elementFromPoint(x, y); return e ? e.tagName + "#" + e.id + "." + e.className + " <" + (e.closest("[class]")?.className) + ">" : null; }, vp.width / 2, vp.height - 55);
console.log("element under thumb start: " + hit);
const rack = await g.page.evaluate(() => [...document.querySelectorAll("#hud *")].filter((e) => /SOFT|CLASSIC/.test(e.textContent) && e.children.length === 0).map((e) => { const r = e.getBoundingClientRect(); return `${e.className} ${r.x|0},${r.y|0} ${r.width|0}x${r.height|0}`; }));
console.log("rack: " + JSON.stringify(rack));
await g.flick({ gap: 13 });
await sleep(150);
m = await g.marks();
console.log(`after flick: can=${m.can} busy=${m.busy} ${m.text.slice(0, 160)}`);
await g.settle();
await g.shot(dir + `stuck-${vp.width}-2.png`);
console.log("errors " + JSON.stringify(g.errors));
await b.close();
