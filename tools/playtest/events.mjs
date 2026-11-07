// Records the pointer events a flick delivers to the canvas, and the launch the game made of it.
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
const press = async (i) => { const s = `#hud [data-intent="${i}"]`; await page.waitForSelector(s); touch ? await page.tap(s) : await page.click(s); await sleep(200); };
await press("TapStart"); await press("TapPull");
await page.waitForFunction(() => document.documentElement.getAttribute("data-can-throw") === "1" && document.documentElement.getAttribute("data-busy") === "0", { timeout: 15000 });
const crease = await page.evaluate(() => +document.documentElement.getAttribute("data-crease-y"));
await page.evaluate(() => { window.__ev = []; const c = document.getElementById("alley"); for (const t of ["pointerdown", "pointermove", "pointerup"]) c.addEventListener(t, (e) => { const co = e.getCoalescedEvents ? e.getCoalescedEvents() : []; window.__ev.push([t, +e.timeStamp.toFixed(1), +performance.now().toFixed(1), e.clientX, e.clientY, co.length]); }, true); });
const d = +(process.argv[4] || 80), n = 8, x = vp.width / 2, y0 = vp.height - 60, y1 = crease + 20;
const T0 = Date.now();
if (touch) { await page.touchscreen.touchStart(x, y0); for (let k = 1; k <= n; k++) { await sleep(d / n); await page.touchscreen.touchMove(x, y0 + (y1 - y0) * k / n); } await page.touchscreen.touchEnd(); }
else { await page.mouse.move(x, y0); await page.mouse.down(); for (let k = 1; k <= n; k++) { await sleep(d / n); await page.mouse.move(x, y0 + (y1 - y0) * k / n); } await page.mouse.up(); }
console.log("wall ms", Date.now() - T0);
await sleep(300);
const ev = await page.evaluate(() => window.__ev);
for (const e of ev) console.log(JSON.stringify(e));
const sv = await page.evaluate(() => { const r = JSON.parse(localStorage.getItem("skee.run")); const t = r.actions.filter((a) => a.throwBall).pop(); return t ? t.throwBall._0 : null; });
const hx = (h) => Buffer.from(h, "hex").readDoubleBE(0).toFixed(4);
console.log(sv ? Object.fromEntries(Object.entries(sv).map(([k, v]) => [k, hx(v)])) : "no throw");
const ev2 = ev.filter((e) => e[0] !== "pointerup"); const a = ev2[0], b = ev2[ev2.length - 1];
console.log("avg speed px/s", ((a[4] - b[4]) / ((b[1] - a[1]) / 1000)).toFixed(0));
await browser.close();
