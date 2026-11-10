// Verifier scratch: the 25-turn limit with a failure on the last line, and a reload mid-call.
import puppeteer from "puppeteer-core";
const url = "http://127.0.0.1:8137/", mock = "http://127.0.0.1:8790";
const mockPost = (p, b) => fetch(mock + p, { method: "POST", body: JSON.stringify(b || {}) }).then((r) => r.json());
const mockLog = () => fetch(mock + "/mock/log").then((r) => r.json());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
const check = (c, m) => { if (c) console.log("ok   " + m); else { failures++; console.log("FAIL " + m); } };
const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
await page.setViewport({ width: 390, height: 844 });
const live = () => page.evaluate(() => [...document.querySelectorAll("#hud [data-intent]")].map((b) => b.dataset.intent));
const hostText = () => page.evaluate(() => document.getElementById("hud-host")?.innerText.replace(/\s+/g, " ") ?? "");
const layer = () => page.evaluate(() => document.documentElement.getAttribute("data-layer"));
const playerLines = () => page.evaluate(() => document.querySelectorAll("#hud-host .bubble-row.mine").length);
async function press(i) { await page.waitForSelector(`#hud [data-intent="${i}"]`, { timeout: 6000 }); await page.click(`#hud [data-intent="${i}"]`); await sleep(120); }
async function waitFor(pred, what, ms = 8000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await pred()) return true; await sleep(40); } check(false, "timed out: " + what + " :: " + (await hostText()).slice(-300)); return false; }
const setField = (v) => page.evaluate((v) => { const f = document.getElementById("host-draft"); f.value = v; f.dispatchEvent(new Event("input", { bubbles: true })); }, v);
async function toHost() { await press("TapStart"); for (let i = 0; i < 5; i++) await press("TapArrivalNext"); await waitFor(async () => (await layer()) === "LayerHost", "host"); }

await mockPost("/mock/reset");
await page.goto(url, { waitUntil: "load" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "load" }); await sleep(900);
await toHost();
await press("TapHostConsent(true)");
await waitFor(async () => (await hostText()).includes("Mock host here"), "hello");
for (let i = 1; i <= 25; i++) {
  if (i === 25) await mockPost("/mock/next", { mode: "garbage" });
  await setField("line number " + i);
  await press("TapHostSend");
  await waitFor(async () => { const t = await hostText(); return !t.includes("is thinking"); }, "reply " + i);
}
let t = await hostText();
check(t.includes("COULDN'T ANSWER"), "garbage on line 25 shows a failure");
let L = await live();
check(L.includes("TapHostRetry") && L.includes("TapCloseHost") && L.includes("TapHostDeal") && !L.includes("TapHostSend"), "line 25 failed: RETRY/DEAL/LEAVE " + JSON.stringify(L));
console.log("   failure:", await page.$eval("#hud-host [data-failure]", (e) => e.dataset.failure));
await press("TapHostRetry");
await waitFor(async () => !(await hostText()).includes("is thinking") && !(await hostText()).includes("COULDN'T"), "retry 25");
t = await hostText();
check(t.includes("That's all the talk"), "after 25 lines: the no-more-talk note");
L = await live();
check(!L.includes("TapHostSend") && !L.some((x) => x.startsWith("TapHostNudge")) && L.includes("TapHostDeal") && L.includes("TapCloseHost") && !L.includes("TapHostRetry"), "only DEAL or LEAVE " + JSON.stringify(L));
check(await page.$eval("#host-draft", (e) => e.disabled), "field disabled");
const n = (await mockLog()).length;
const g = await page.evaluate(async () => { const g = await import("/arcade_input.mjs"); g.input_queue_tap(19); g.input_queue_tap(7000); });
await setField("one more"); await page.focus("#host-draft").catch(() => {}); await sleep(300);
check((await mockLog()).length === n, "injected SAY/nudge after 25 sent nothing");
check(await playerLines() === 25, "25 player lines: " + await playerLines());
const log = await mockLog();
const lastBody = JSON.parse(log[log.length - 1].body);
console.log("   messages in the last request:", lastBody.messages.length);

// LEAVE the open arrival table: walkthrough starts, arrival not done.
await press("TapCloseHost");
await sleep(300);
console.log("   after leave layer:", await layer(), "arrivalDone:", await page.evaluate(() => localStorage.getItem("skee.arrivalDone")), "wallet comps:", await page.evaluate(() => JSON.parse(localStorage.getItem("skee.wallet") || "{}").comps));

// Reload mid-call.
await mockPost("/mock/reset");
await page.reload({ waitUntil: "load" }); await sleep(900);
console.log("   after reload layer:", await layer(), "consent:", await page.evaluate(() => localStorage.getItem("skee.hostConsent")));
const L2 = await live();
console.log("   live:", JSON.stringify(L2.slice(0, 12)));
if (L2.includes("TapStart")) {
  await toHost();
  await waitFor(async () => (await hostText()).includes("Mock host here"), "auto hello with saved consent");
  check(!(await live()).includes("TapHostConsent(true)"), "saved consent: no card");
  await mockPost("/mock/next", { mode: "timeout" });
  await setField("hang on"); await press("TapHostSend"); await sleep(300);
  await page.reload({ waitUntil: "load" }); await sleep(900);
  await toHost();
  await waitFor(async () => (await hostText()).includes("Mock host here"), "hello after reload mid-call");
  t = await hostText();
  check(!t.includes("hang on"), "fresh table after reload mid-call");
  check(!(await live()).includes("TapHostRetry"), "no stale failure after reload");
}
console.log("errors:", JSON.stringify(errors));
console.log(failures ? `PROBE FAIL ${failures}` : "PROBE PASS");
await browser.close();
