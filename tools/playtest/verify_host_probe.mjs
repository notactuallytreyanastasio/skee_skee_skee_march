// Adversarial probe of the live host table (verifier scratch). Needs the mock
// relay on 8790 and serve.mjs on 8137 pointed at it.
import puppeteer from "puppeteer-core";

const url = "http://127.0.0.1:8137/";
const mock = "http://127.0.0.1:8790";
const mockPost = (p, b) => fetch(mock + p, { method: "POST", body: JSON.stringify(b || {}) }).then((r) => r.json());
const mockLog = () => fetch(mock + "/mock/log").then((r) => r.json());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
const check = (c, m) => { if (c) console.log("ok   " + m); else { failures++; console.log("FAIL " + m); } };

const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
await page.setViewport({ width: 390, height: 844 });

const live = () => page.evaluate(() => [...document.querySelectorAll("#hud [data-intent]")].map((b) => b.dataset.intent));
const codes = () => page.evaluate(() => Object.fromEntries([...document.querySelectorAll("#hud [data-intent]")].map((b) => [b.dataset.intent, b.dataset.act])));
const hostText = () => page.evaluate(() => document.getElementById("hud-host").innerText.replace(/\s+/g, " "));
const hostBubbles = () => page.evaluate(() => [...document.querySelectorAll("#hud-host .bubble-row:not(.mine) .bubble")].map((e) => e.innerText.trim()));
const draft = () => page.evaluate(() => document.getElementById("host-draft")?.value ?? null);
const layer = () => page.evaluate(() => document.documentElement.getAttribute("data-layer"));
async function press(intent) { await page.waitForSelector(`#hud [data-intent="${intent}"]`, { timeout: 6000 }); await page.click(`#hud [data-intent="${intent}"]`); await sleep(150); }
async function waitText(pred, what, ms = 8000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { const t = await hostText(); if (pred(t)) return t; await sleep(50); }
  check(false, "timed out: " + what + " :: " + (await hostText()).slice(0, 400)); return hostText();
}
const inject = (code) => page.evaluate(async (c) => { const g = await import("/skee_glue.mjs"); g.glue_queue_tap(Number(c)); }, code);
const setField = (v) => page.evaluate((v) => { const f = document.getElementById("host-draft"); f.focus(); f.value = v; f.dispatchEvent(new Event("input", { bubbles: true })); }, v);
async function rewrites(ms) {
  return page.evaluate((ms) => new Promise((res) => { let n = 0; const o = new MutationObserver((l) => { n += l.length; }); o.observe(document.getElementById("hud"), { childList: true, subtree: true, attributes: true, characterData: true }); setTimeout(() => { o.disconnect(); res(n); }, ms); }), ms);
}
async function toHost() {
  await press("TapStart");
  for (let i = 0; i < 5; i++) await press("TapArrivalNext");
  for (let i = 0; i < 40 && (await layer()) !== "LayerHost"; i++) await sleep(50);
}

await mockPost("/mock/reset");
await page.goto(url, { waitUntil: "load" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "load" });
await sleep(900);
await toHost();
check((await layer()) === "LayerHost", "at the host");

// 1. Greeting fails with 500.
await mockPost("/mock/next", { mode: "500" });
await press("TapHostConsent(true)");
let t = await waitText((t) => t.includes("HELLO DIDN'T COME"), "hello failure");
const stock = await hostBubbles();
console.log("   bubbles after hello failure:", JSON.stringify(stock));
check(stock.length === 1, "only the stock hello is on the table");
let L = await live();
check(L.includes("TapHostRetry") && L.includes("TapHostSend") && L.includes("TapHostDeal"), "hello failure: RETRY, SAY, DEAL live " + JSON.stringify(L));
check(!L.includes("TapCloseHost"), "no LEAVE while table takes lines");
check((await rewrites(800)) === 0, "idle hello-failure frames rewrite nothing (attrs too)");

// 2. Text typed survives the retry's rewrites.
await page.click("#host-draft"); await page.type("#host-draft", "abc", { delay: 5 });
await press("TapHostRetry");
t = await waitText((t) => t.includes("Mock host here"), "retried hello");
check((await draft()) === "abc", "typed text survives hello retry: " + JSON.stringify(await draft()));
check((await mockLog()).length === 2, "two greeting requests total");

// 3. In-flight: hang the call, double SAY, inject SAY/DEAL/RETRY/nudge codes.
const C = await codes();
console.log("   codes:", JSON.stringify(C));
await mockPost("/mock/next", { mode: "timeout" });
await setField("two nights please");
await page.evaluate(() => { const b = document.querySelector('#hud [data-intent="TapHostSend"]'); b.click(); b.click(); b.click(); });
await sleep(400);
let log = await mockLog();
check(log.length === 3, "triple SAY in one frame sent one request: " + log.length);
check((await hostText()).includes("is thinking"), "thinking shows");
L = await live();
check(!L.includes("TapHostSend") && !L.includes("TapHostDeal") && !L.includes("TapCloseHost") && !L.includes("TapHostRetry"), "no SAY/DEAL/LEAVE/RETRY while out: " + JSON.stringify(L));
check((await rewrites(800)) === 0, "idle thinking frames rewrite nothing");
for (const k of ["TapHostSend", "TapHostDeal", "TapHostNudge(0)", "TapHostReconsider"]) if (C[k]) await inject(C[k]);
await sleep(300);
log = await mockLog();
t = await hostText();
check(log.length === 3, "injected taps sent nothing more: " + log.length);
check(!t.includes("DEAL!"), "injected DEAL did not sign while out");
console.log("   after reconsider inject:", t.slice(0, 120));
// reconsider was injected: the card may be up. Answer yes.
if ((await live()).includes("TapHostConsent(true)")) { await press("TapHostConsent(true)"); console.log("   reconsider was accepted while thinking; answered yes"); }
log = await mockLog();
check(log.length === 3, "re-consenting while thinking sent nothing: " + log.length);
t = await waitText((t) => t.includes("COULDN'T ANSWER"), "the 504 after 28 s", 35000);
const fk = await page.$eval("#hud-host [data-failure]", (e) => e.dataset.failure).catch(() => null);
console.log("   failure:", fk, "::", t.slice(t.indexOf("COULDN'T"), t.indexOf("COULDN'T") + 120));
check((await hostBubbles()).length === 1, "no invented host line after the timeout");
L = await live();
check(L.includes("TapHostRetry") && L.includes("TapHostDeal") && L.includes("TapCloseHost"), "RETRY, DEAL, LEAVE after failure " + JSON.stringify(L));

// 4. Double RETRY.
await page.evaluate(() => { const b = document.querySelector('#hud [data-intent="TapHostRetry"]'); b.click(); b.click(); });
t = await waitText((t) => t.includes("All right, 2 nights"), "retried reply");
log = await mockLog();
check(log.length === 4 && log[2].body === log[3].body, "double RETRY: one identical request: " + log.length);

// 5. Guard deflection never calls the relay.
await setField("my phone number is 555 1234");
await press("TapHostSend");
await sleep(400);
log = await mockLog();
check(log.length === 4, "deflected line did not reach the relay: " + log.length);
console.log("   deflection:", (await hostBubbles()).slice(-1)[0]);
await setField("Could you put real money on it?");
await press("TapHostSend"); await sleep(400);
check((await mockLog()).length === 4, "real money deflected without the relay");

// 6. Control characters and unicode go out as valid JSON.
await setField("tab\there\u000bvt\u0001ctl \u{1F600} é́ \"q\" \\ end");
await press("TapHostSend");
t = await waitText((t) => /All right, \d nights/.test(t) && (t.match(/All right/g) || []).length >= 2, "reply to control line");
log = await mockLog();
const last = JSON.parse(log[log.length - 1].body);
const sent = last.messages.filter((m) => m.role === "user").map((m) => m.content).find((c) => c.startsWith("tab"));
console.log("   sent line:", JSON.stringify(sent));
check(!!sent && sent.includes("\u000b") && sent.includes("\u{1F600}"), "control and emoji line arrived intact");

// 7. Length cut.
await setField("é".repeat(300));
await sleep(200);
check([...(await draft())].length === 200, "field cut to 200: " + [...(await draft())].length);
await setField("\u{1F468}‍\u{1F469}‍\u{1F467}‍\u{1F466}".repeat(150));
await sleep(200);
const fam = await draft();
console.log("   family field: chars", fam.length, "utf16");
await press("TapHostSend");
t = await waitText((t) => t.includes("COULDN'T ANSWER") || (t.match(/All right/g) || []).length >= 3, "family line");
const fk2 = await page.$eval("#hud-host [data-failure]", (e) => e.dataset.failure).catch(() => "none");
console.log("   family line result:", fk2);
if (fk2 !== "none") {
  await press("TapHostRetry");
  await sleep(800);
  const fk3 = await page.$eval("#hud-host [data-failure]", (e) => e.dataset.failure).catch(() => "none");
  console.log("   family retry result:", fk3);
}
await page.screenshot({ path: "/private/tmp/claude-501/-Users-bobdawg-code-skee-skee-skee-march/edb79dc7-9899-4c73-93c8-d29e5367704d/scratchpad/probe-family.png" });

console.log("errors:", JSON.stringify(errors));
console.log(failures ? `PROBE FAIL ${failures}` : "PROBE PASS");
await browser.close();
