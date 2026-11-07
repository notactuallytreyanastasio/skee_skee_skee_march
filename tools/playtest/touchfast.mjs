// Realistic-speed touch flicks at 390x844 through raw CDP (puppeteer's touchscreen
// waits ~35 ms per move, too slow for a real flick). Plays a whole run with
// fast flicks and reports outcomes. node tools/playtest/touchfast.mjs [url] [n]
import puppeteer from "puppeteer-core";
const url = process.argv[2] || "http://127.0.0.1:8161/";
const N = +(process.argv[3] || 18);
const vp = { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const page = await browser.newPage(); await page.setViewport(vp);
const errors = []; page.on("pageerror", (e) => errors.push(e.message)); page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
const cdp = await page.createCDPSession();
await page.goto(url); await page.evaluate(() => { localStorage.clear(); localStorage.setItem("skee.arrivalDone","true"); localStorage.setItem("skee.walkthroughDone","true"); });
await page.reload(); await sleep(800);
const marks = () => page.evaluate(() => { const el = document.documentElement; return { can: el.getAttribute("data-can-throw"), busy: el.getAttribute("data-busy"), crease: +el.getAttribute("data-crease-y"), live: [...document.querySelectorAll("#hud [data-intent]")].map((b) => b.dataset.intent), text: document.getElementById("hud").innerText.replace(/\s+/g, " ") }; });
const press = async (i) => { const s = `#hud [data-intent="${i}"]`; await page.waitForSelector(s); await page.tap(s); await sleep(200); };
async function flick(pts, gap) {
  const ps = [];
  ps.push(cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: pts[0][0], y: pts[0][1], id: 1 }] }));
  for (let i = 1; i < pts.length; i++) { await sleep(gap); ps.push(cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: pts[i][0], y: pts[i][1], id: 1 }] })); }
  await sleep(4);
  ps.push(cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }));
  await Promise.all(ps);
}
await page.evaluate(() => { window.__ev = []; const c = document.getElementById("alley"); for (const t of ["pointerdown", "pointermove", "pointerup"]) c.addEventListener(t, (e) => window.__ev.push([t, e.timeStamp, e.clientX, e.clientY]), true); });
await press("TapStart");
let thrown = 0, scored = 0, gutters = 0;
for (let i = 0; i < 500 && thrown < N; i++) {
  const m = await marks();
  if (m.live.includes("TapGotIt")) { await press("TapGotIt"); continue; }
  if (m.live.includes("TapLeaveCounter")) { console.log("COUNTER " + m.text.match(/PRIZE COUNTER \d+/)); await press("TapLeaveCounter"); continue; }
  if (m.live.includes("TapNewRun") && /GAME OVER/.test(m.text)) { console.log("GAME OVER " + m.text.match(/GAME OVER.*WINNINGS/)); await press("TapNewRun"); continue; }
  if (m.busy === "1") { await sleep(80); continue; }
  if (m.can === "1") {
    const steps = 6 + (thrown % 3) * 2, gap = 8 + (thrown % 4) * 3, xoff = [0, -25, 25, 10, -10][thrown % 5];
    const x = 195 + xoff, y0 = 790, y1 = m.crease + 15 + (thrown % 2) * 40;
    const pts = []; for (let k = 0; k <= steps; k++) { const f = k / steps; const e = f * f * (3 - 2 * f); pts.push([x + (thrown % 3 - 1) * 6 * f, y0 + (y1 - y0) * e]); }
    await page.evaluate(() => { window.__ev = []; });
    await flick(pts, gap); thrown++;
    await sleep(100);
    const ev = await page.evaluate(() => window.__ev);
    let a; while (true) { a = await marks(); if (a.busy === "0") break; await sleep(60); }
    const sv = await page.evaluate(() => { const r = JSON.parse(localStorage.getItem("skee.run")); const t = r.actions.filter((a) => a.throwBall).pop(); return t ? t.throwBall._0 : null; });
    const hx = (h) => Buffer.from(h, "hex").readDoubleBE(0).toFixed(3);
    const out = a.text.match(/BALLS (.*)$/)?.[1]?.slice(0, 70);
    if (/GUTTER/.test(out || "")) gutters++; else scored++;
    const dur = ev.length ? (ev[ev.length - 1][1] - ev[0][1]).toFixed(0) : "?";
    console.log(`#${thrown} ev=${ev.length} dur=${dur}ms power=${sv && hx(sv.power)} start=${sv && hx(sv.start)} aim=${sv && hx(sv.aim)} | ${out}`);
    continue;
  }
  if (m.live.includes("TapPull")) { await press("TapPull"); continue; }
  await sleep(100);
}
console.log(`thrown ${thrown} gutter ${gutters} other ${scored}; errors ${JSON.stringify(errors)}`);
await page.screenshot({ path: new URL("./shots/func2/touchfast-end.png", import.meta.url).pathname });
await browser.close();
