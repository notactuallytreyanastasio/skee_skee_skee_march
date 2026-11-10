// Verifier scratch: typing rewrites no pane; a refused reply through the mock relay.
import puppeteer from "puppeteer-core";
const url = "http://127.0.0.1:8137/", mock = "http://127.0.0.1:8790";
const mockPost = (p, b) => fetch(mock + p, { method: "POST", body: JSON.stringify(b || {}) }).then((r) => r.json());
const mockLog = () => fetch(mock + "/mock/log").then((r) => r.json());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844 });
const hostText = () => page.evaluate(() => document.getElementById("hud-host")?.innerText.replace(/\s+/g, " ") ?? "");
async function press(i) { await page.waitForSelector(`#hud [data-intent="${i}"]`, { timeout: 6000 }); await page.click(`#hud [data-intent="${i}"]`); await sleep(150); }
await mockPost("/mock/reset");
await page.goto(url, { waitUntil: "load" }); await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: "load" }); await sleep(900);
await press("TapStart"); for (let i = 0; i < 5; i++) await press("TapArrivalNext"); await sleep(300);
await press("TapHostConsent(true)"); await sleep(800);
await page.evaluate(() => { window.__n = 0; window.__o = new MutationObserver((l) => { window.__n += l.length; }); window.__o.observe(document.getElementById("hud"), { childList: true, subtree: true, attributes: true, characterData: true }); });
await page.click("#host-draft"); await page.keyboard.type("a fairly long line typed key by key", { delay: 20 });
const n = await page.evaluate(() => window.__n);
console.log("mutations while typing:", n, "focus kept:", await page.evaluate(() => document.activeElement.id));
await mockPost("/mock/next", { mode: "refused" });
await page.keyboard.press("Enter");
await sleep(1500);
const log = await mockLog();
console.log("requests:", log.length, "last two bodies' system msgs:", log.slice(-2).map((e) => JSON.parse(e.body).messages.filter((m) => m.role === "system").length));
console.log("failure:", await page.$eval("#hud-host [data-failure]", (e) => e.dataset.failure).catch(() => "none"));
console.log((await hostText()).slice(-260));
await browser.close();
