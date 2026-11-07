// Power sweep: flick durations vs outcome popup. node tools/playtest/sweep.mjs [url] [phone|desktop]
import puppeteer from "puppeteer-core";
const url = process.argv[2] || "http://127.0.0.1:8161/";
const which = process.argv[3] || "phone";
const vp = which === "phone" ? { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { width: 1280, height: 800, deviceScaleFactor: 1 };
const touch = which === "phone";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const page = await browser.newPage(); await page.setViewport(vp);
await page.goto(url); await page.evaluate(() => { localStorage.clear(); localStorage.setItem("skee.arrivalDone","true"); localStorage.setItem("skee.walkthroughDone","true"); });
await page.reload(); await sleep(800);
const marks = () => page.evaluate(() => { const el = document.documentElement; return { can: el.getAttribute("data-can-throw"), busy: el.getAttribute("data-busy"), crease: +el.getAttribute("data-crease-y"), live: [...document.querySelectorAll("#hud [data-intent]")].map((b) => b.dataset.intent), text: document.getElementById("hud").innerText.replace(/\s+/g, " ") }; });
const press = async (i) => { const s = `#hud [data-intent="${i}"]`; await page.waitForSelector(s); touch ? await page.tap(s) : await page.click(s); await sleep(200); };
await press("TapStart");
const durs = [40, 60, 80, 100, 130, 160, 200, 260, 330, 420, 550];
let di = 0, res = [];
for (let i = 0; i < 400 && di < durs.length * 2; i++) {
  const m = await marks();
  if (m.live.includes("TapGotIt")) { await press("TapGotIt"); continue; }
  if (m.live.includes("TapLeaveCounter")) { await press("TapLeaveCounter"); continue; }
  if (m.live.includes("TapNewRun") && /GAME OVER/.test(m.text)) { await press("TapNewRun"); await sleep(300); continue; }
  if (m.busy === "1") { await sleep(80); continue; }
  if (m.can === "1") {
    const d = durs[di % durs.length]; di++;
    const n = 8, x = vp.width / 2, y0 = vp.height - 60, y1 = m.crease + 20;
    const s0 = m.text.match(/(\d+) \/ (\d+)/);
    if (touch) { await page.touchscreen.touchStart(x, y0); for (let k = 1; k <= n; k++) { await sleep(d / n); await page.touchscreen.touchMove(x, y0 + (y1 - y0) * k / n); } await page.touchscreen.touchEnd(); }
    else { await page.mouse.move(x, y0); await page.mouse.down(); for (let k = 1; k <= n; k++) { await sleep(d / n); await page.mouse.move(x, y0 + (y1 - y0) * k / n); } await page.mouse.up(); }
    const t0 = Date.now(); await sleep(100);
    let a; while (true) { a = await marks(); if (a.busy === "0") break; await sleep(50); }
    const s1 = a.text.match(/(\d+) \/ (\d+)/);
    const pop = a.text.match(/BALLS (.*)$/)?.[1]?.slice(0, 90);
    const sv = await page.evaluate(() => { try { const r = JSON.parse(localStorage.getItem("skee.run")); const t = r.actions.filter((a) => a.throwBall).pop(); return t ? t.throwBall._0 : null; } catch (e) { return String(e); } });
    const hx = (h) => { const b = Buffer.from(h, "hex"); return b.readDoubleBE(0).toFixed(3); };
    const pw = sv ? `power=${hx(sv.power)} speed=${hx(sv.speed)} aim=${hx(sv.aim)} start=${hx(sv.start)} skid=${hx(sv.skid)}` : "nosave";
    res.push(`${pw} ${d}ms (${((y0 - y1) / d * 1000).toFixed(0)}px/s): settle ${Date.now() - t0}ms | ${pop}`);
    console.log(res[res.length - 1]);
    continue;
  }
  if (m.live.includes("TapPull")) { await press("TapPull"); continue; }
  await sleep(100);
}
await browser.close();
