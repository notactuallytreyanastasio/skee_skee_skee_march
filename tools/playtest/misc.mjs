// Bets cost, double-tapped SPIN, rotation mid-throw, tab hidden mid-roll.
import { launch, open, sleep, PHONE } from "./lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8161/";
const dir = new URL("./shots/func2/", import.meta.url).pathname;
const b = await launch();
const seen = JSON.stringify(["combo","hotSpot","charm","specialty","boardEdit","boss","bets","balls","fever","freeGames","jackpot","gameOver"]);
const g = await open(b, url, PHONE, { "skee.arrivalDone": "true", "skee.walkthroughDone": "true", "skee.tipsSeen": seen });
await g.press("TapStart");
let m = await g.marks();
console.log("live " + JSON.stringify(m.live));
const tix = () => +(m.text.match(/\/ \d+ (\d+)/)?.[1]);
console.log("tickets " + tix());
const bets = m.live.filter((x) => x.startsWith("TapSetBet"));
console.log("bets " + JSON.stringify(bets));
if (bets.length) {
  await g.press(bets[bets.length - 1]); m = await g.marks();
  await g.shot(dir + "bet5.png");
  console.log("after picking 5 lines: tickets " + tix() + " | " + m.text.slice(0, 220));
  // Double tap SPIN quickly.
  const sel = '#hud [data-intent="TapPull"]';
  await Promise.all([g.page.tap(sel), sleep(30).then(() => g.page.tap(sel).catch((e) => console.log("2nd tap: " + e.message)))]);
  await sleep(400); m = await g.marks();
  console.log("after double SPIN: tickets " + tix() + " busy " + m.busy);
  await g.settle(); m = await g.marks();
  const run = await g.page.evaluate(() => JSON.parse(localStorage.getItem("skee.run")).actions);
  console.log("actions " + JSON.stringify(run));
  console.log("settled: tickets " + tix() + " | " + m.text.slice(0, 200));
}
// Throw, rotate mid-roll.
m = await g.marks();
if (m.can === "1") {
  await g.flick({ gap: 13 }); await sleep(300);
  await g.page.setViewport({ ...PHONE, width: 844, height: 390, isLandscape: true });
  await sleep(500); await g.shot(dir + "rotated-mid-roll.png");
  m = await g.marks(); console.log(`rotated: busy=${m.busy} crease=${m.crease}`);
  await g.settle(); await g.page.setViewport(PHONE); await sleep(400); await g.shot(dir + "rotated-back.png");
  m = await g.marks(); console.log("back: " + m.text.slice(0, 200));
}
// Hide the tab mid-roll (visibilitychange), then show.
m = await g.marks();
if (m.can === "1") {
  await g.flick({ gap: 13 }); await sleep(200);
  const t0 = Date.now();
  await g.page.evaluate(() => { Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true }); Object.defineProperty(document, "hidden", { value: true, configurable: true }); document.dispatchEvent(new Event("visibilitychange")); });
  await sleep(1500);
  await g.page.evaluate(() => { Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true }); Object.defineProperty(document, "hidden", { value: false, configurable: true }); document.dispatchEvent(new Event("visibilitychange")); });
  await g.settle(); m = await g.marks();
  console.log(`hidden 1.5 s mid-roll, settled after ${Date.now() - t0} ms: ${m.text.slice(0, 160)}`);
}
console.log("errors " + JSON.stringify(g.errors));
await b.close();
