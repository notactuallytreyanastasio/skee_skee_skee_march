// Shared helpers for the round-1 functional playtests.
import puppeteer from "puppeteer-core";
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const PHONE = { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true };
export const DESK = { width: 1280, height: 800, deviceScaleFactor: 1 };
export async function launch() { return puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true }); }
export async function open(browser, url, vp, store) {
  const page = await browser.newPage(); await page.setViewport(vp);
  const errors = []; page.on("pageerror", (e) => errors.push("pageerror " + e.message)); page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errors.push(m.type() + " " + m.text()); });
  const cdp = await page.createCDPSession();
  await page.goto(url);
  if (store) { await page.evaluate((s) => { localStorage.clear(); for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); }, store); await page.reload(); }
  await page.waitForFunction(() => document.documentElement.getAttribute("data-layer"));
  await page.evaluate(() => document.fonts.ready); await sleep(400);
  const touch = !!vp.hasTouch;
  const g = {
    page, cdp, errors, vp, touch,
    marks: () => page.evaluate(() => { const el = document.documentElement; return { layer: el.getAttribute("data-layer"), can: el.getAttribute("data-can-throw"), busy: el.getAttribute("data-busy"), crease: +el.getAttribute("data-crease-y"), live: [...document.querySelectorAll("#hud [data-intent]")].map((b) => b.dataset.intent), text: document.getElementById("hud").innerText.replace(/\s+/g, " ") }; }),
    press: async (i) => { const s = `#hud [data-intent="${i}"]`; await page.waitForSelector(s, { timeout: 6000 }); touch ? await page.tap(s) : await page.click(s); await sleep(200); },
    tap: async (x, y) => { touch ? await page.touchscreen.tap(x, y) : await page.mouse.click(x, y); await sleep(200); },
    // A realistic flick: raw CDP events `gap` ms apart, smoothstep eased.
    flick: async ({ xoff = 0, dx = 0, y1off = 15, steps = 8, gap = 13, y1 = null } = {}) => {
      const m = await g.marks();
      const x = vp.width / 2 + xoff, y0 = vp.height - 55, Y1 = y1 ?? m.crease + y1off;
      const pts = []; for (let k = 0; k <= steps; k++) { const f = k / steps; const e = f * f * (3 - 2 * f); pts.push([x + dx * f, y0 + (Y1 - y0) * e]); }
      const ps = [];
      if (touch) {
        ps.push(cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: pts[0][0], y: pts[0][1], id: 1 }] }));
        for (let i = 1; i < pts.length; i++) { await sleep(gap); ps.push(cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: pts[i][0], y: pts[i][1], id: 1 }] })); }
        await sleep(4); ps.push(cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }));
      } else {
        ps.push(cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x: pts[0][0], y: pts[0][1], button: "left", buttons: 1, clickCount: 1 }));
        for (let i = 1; i < pts.length; i++) { await sleep(gap); ps.push(cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: pts[i][0], y: pts[i][1], button: "left", buttons: 1 })); }
        await sleep(4); ps.push(cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: pts[pts.length - 1][0], y: pts[pts.length - 1][1], button: "left", buttons: 0, clickCount: 1 }));
      }
      await Promise.all(ps);
    },
    settle: async (ms = 30000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const m = await g.marks(); if (m.busy === "0") return m; await sleep(60); } return null; },
    lastLaunch: async () => { const sv = await page.evaluate(() => { try { const r = JSON.parse(localStorage.getItem("skee.run")); const t = r.actions.filter((a) => a.throwBall).pop(); return t ? t.throwBall._0 : null; } catch (e) { return null; } }); if (!sv) return null; return Object.fromEntries(Object.entries(sv).map(([k, v]) => [k, +Buffer.from(v, "hex").readDoubleBE(0).toFixed(3)])); },
    shot: async (p) => { await page.screenshot({ path: p }); console.log("  shot " + p); },
  };
  return g;
}
