// Headless Chrome playtest of the HUD (shell/hud.march over Skee.HudView).
//   node tools/playtest/hud_playtest.mjs [url] [mock]
//   (defaults http://127.0.0.1:8137/ and http://127.0.0.1:8790)
// Needs `npm install` in tools/playtest once, the mock relay
// (node tools/playtest/mock_relay.mjs 8790) and serve.mjs pointed at it:
//   SKEE_HOST_RELAY=http://127.0.0.1:8790/chat node tools/serve/serve.mjs dist 8137
// No real relay or model is ever called.
// For a 390x844 touch phone (taps) and a 1280x800 mouse desktop (clicks):
// title, the prize shop, Sal, the first host (phone: AI chat on, the hello,
// a typed line and its reply moving the offer, a forced 429 with RETRY,
// Enter to send, DEAL, and the deal in the run; desktop: AI chat off, then
// DEAL), the first coach card,
// the machine, the Guide (contents and a page), a pull, a flick and the
// settled frame, every step driven through the HUD's own buttons by their
// data-intent. Checks: each screen's words, that idle frames rewrite no pane,
// that a button under an overlay is not tappable, and a clean console.
// Screenshots: tools/playtest/shots/hud-<viewport>-<n>-<what>.png.
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const shots = join(here, "shots");
mkdirSync(shots, { recursive: true });
const url = process.argv[2] || "http://127.0.0.1:8137/";
const mock = process.argv[3] || "http://127.0.0.1:8790";
const mockPost = (path, body) => fetch(mock + path, { method: "POST", body: JSON.stringify(body || {}) }).then((r) => r.json());
const mockLog = () => fetch(mock + "/mock/log").then((r) => r.json());
// Responses the playtest asks the mock to fail: not console noise.
let forced = 0;
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
const fail = (msg) => { failures++; console.log("FAIL " + msg); };
const ok = (msg) => console.log("ok   " + msg);
const check = (cond, msg) => (cond ? ok(msg) : fail(msg));

async function marks(page) {
  return page.evaluate(() => {
    const el = document.documentElement;
    return {
      layer: el.getAttribute("data-layer"),
      canThrow: el.getAttribute("data-can-throw"),
      busy: el.getAttribute("data-busy"),
      crease: Number(el.getAttribute("data-crease-y")),
      live: [...document.querySelectorAll("#hud [data-intent]")].map((b) => b.dataset.intent),
    };
  });
}

async function waitFor(page, pred, what, ms = 10000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const m = await marks(page);
    if (pred(m)) return m;
    await sleep(50);
  }
  fail("timed out waiting for " + what + ": " + JSON.stringify(await marks(page)));
  return marks(page);
}

async function text(page) {
  return page.evaluate(() => document.getElementById("hud").innerText.replace(/\s+/g, " "));
}

async function shows(page, words, where) {
  const t = await text(page);
  const missing = words.filter((w) => !t.includes(w));
  check(missing.length === 0, `${where} shows ${JSON.stringify(words)}` + (missing.length ? ` (missing ${JSON.stringify(missing)})` : ""));
}

// Press a HUD button the way the viewport does: a touch tap or a mouse click.
async function press(page, intent, touch) {
  const sel = `#hud [data-intent="${intent}"]`;
  await page.waitForSelector(sel, { timeout: 6000 });
  if (touch) await page.tap(sel); else await page.click(sel);
  await sleep(150);
}

async function shot(page, name, n, what) {
  await page.screenshot({ path: join(shots, `hud-${name}-${n}-${what}.png`) });
}

// Panes rewritten over `ms` of frames: a MutationObserver on the HUD.
async function rewrites(page, ms) {
  return page.evaluate((ms) => new Promise((res) => {
    let n = 0;
    const o = new MutationObserver((list) => { n += list.length; });
    o.observe(document.getElementById("hud"), { childList: true, subtree: true });
    setTimeout(() => { o.disconnect(); res(n); }, ms);
  }), ms);
}

async function flick(page, w, h, crease, touch, steps = 8, gap = 14) {
  const x = w / 2, y0 = h - 40, y1 = crease + 12;
  if (touch) {
    await page.touchscreen.touchStart(x, y0);
    for (let i = 1; i <= steps; i++) { await sleep(gap); await page.touchscreen.touchMove(x + i * 0.5, y0 + (y1 - y0) * (i / steps)); }
    await page.touchscreen.touchEnd();
  } else {
    await page.mouse.move(x, y0);
    await page.mouse.down();
    for (let i = 1; i <= steps; i++) { await sleep(gap); await page.mouse.move(x + i * 0.5, y0 + (y1 - y0) * (i / steps)); }
    await page.mouse.up();
  }
}

async function hostText(page) {
  return page.evaluate(() => document.getElementById("hud-host").innerText.replace(/\s+/g, " "));
}

async function waitText(page, pred, what, ms = 8000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const t = await hostText(page);
    if (pred(t)) return t;
    await sleep(50);
  }
  const t = await hostText(page);
  fail(`timed out waiting for ${what}: ${t.slice(0, 300)}`);
  return t;
}

const draft = (page) => page.evaluate(() => document.getElementById("host-draft")?.value ?? null);
// The offer card's numbers: nights, tickets a night, credit.
const offer = (page) => page.evaluate(() => [...document.querySelectorAll("#hud-host .host-term > .cel:first-child")].map((e) => e.textContent));

async function typeLine(page, text, touch) {
  if (touch) await page.tap("#host-draft"); else await page.click("#host-draft");
  await page.type("#host-draft", text, { delay: 8 });
  await sleep(120);
}

// The phone: AI chat on, against the mock relay.
let dealt = null;
async function liveHost(page, name, touch) {
  await press(page, "TapHostConsent(true)", touch);
  let t = await waitText(page, (t) => t.includes("Welcome in! Mock host here"), "the model's hello");
  check(!t.includes("Here's my offer"), "the stock hello gave way to the model's");
  let log = await mockLog();
  check(log.length === 1 && log[0].body.includes("The guest has just sat down."), `one greeting request reached the mock (${log.length})`);
  const idle = await rewrites(page, 1000);
  check(idle === 0, `an idle host table rewrites no pane (${idle} mutations in 1 s)`);
  await shot(page, name, "4b", "host-hello");

  const before = await offer(page);
  await typeLine(page, "Could I get two nights?", touch);
  check((await draft(page)) === "Could I get two nights?", "the field holds what was typed");
  await press(page, "TapHostSend", touch);
  check((await draft(page)) === "", "SAY empties the field");
  t = await waitText(page, (t) => t.includes("All right, 2 nights"), "the host's reply");
  const after = await offer(page);
  check(t.includes("Could I get two nights?"), "the line is on the table");
  check(JSON.stringify(before) !== JSON.stringify(after), `the reply moved the offer: ${before.join("/")} -> ${after.join("/")}`);
  await shot(page, name, "4c", "host-reply");

  await mockPost("/mock/next", { mode: "429" });
  forced++;
  await typeLine(page, "keep this", touch);
  await press(page, "TapHostNudge(1)", touch);
  t = await waitText(page, (t) => t.includes("COULDN'T ANSWER"), "the 429");
  check(t.includes("HTTP 429") && t.includes("RETRY") && t.includes("LEAVE"), "the typed failure with RETRY and LEAVE");
  check(!t.includes("All right, 3 nights"), "no host line was invented");
  const failed = await marks(page);
  check(failed.live.includes("TapHostRetry") && failed.live.includes("TapHostDeal") && !failed.live.includes("TapHostSend"), "RETRY and DEAL, no SAY");
  check((await page.$eval("#hud-host [data-failure]", (e) => e.dataset.failure)) === "FailHttp(429)", "data-failure names it");
  check((await draft(page)) === "keep this", "the typed text survived the table's rewrites");
  await shot(page, name, "4d", "host-429");
  await press(page, "TapHostRetry", touch);
  t = await waitText(page, (t) => t.includes("All right, 3 nights"), "the retried reply");
  check(!t.includes("COULDN'T ANSWER"), "the failure is gone");
  log = await mockLog();
  check(log.length === 4 && log[2].body === log[3].body, `RETRY sent the same request again (${log.length} requests)`);

  await page.focus("#host-draft");
  await page.$eval("#host-draft", (e) => e.select());
  await page.keyboard.type("Thanks for that!", { delay: 8 });
  await page.keyboard.press("Enter");
  await waitText(page, (t) => t.includes("Thanks for that!"), "Enter sends the line");
  await waitText(page, (t) => (t.match(/All right, 3 nights/g) || []).length >= 2, "the reply to Enter");
  check((await draft(page)) === "", "Enter empties the field");

  dealt = await offer(page);
  await press(page, "TapHostDeal", touch);
  t = await waitText(page, (t) => t.includes("DEAL!"), "the deal");
  const nights = Number(dealt[0]), tix = Number(dealt[1].replace("+", ""));
  check(t.includes(`you start with ${nights} night${nights === 1 ? "" : "s"} · +${tix} tix`), `the ending's terms are the offer signed (${dealt.join("/")})`);
  check(t.includes("LEARN TO PLAY"), "LEARN TO PLAY");
  const w = await page.evaluate(() => JSON.parse(localStorage.getItem("skee.wallet")));
  check(JSON.stringify(w.comps).includes(`"nights":${nights}`), "the deal is banked in the wallet: " + JSON.stringify(w.comps));
  check((await page.evaluate(() => localStorage.getItem("skee.arrivalDone"))) === "true", "the arrival is done");
  check((await page.evaluate(() => localStorage.getItem("skee.hostConsent"))) === "true", "the AI chat answer is saved");
  await shot(page, name, "4e", "host-deal");
}

// After the walkthrough the first real game checks in: one night used, its tickets added.
async function dealInRun(page) {
  if (!dealt) return;
  const nights = Number(dealt[0]), tix = Number(dealt[1].replace("+", ""));
  const run = await page.evaluate(() => JSON.parse(localStorage.getItem("skee.run")));
  const w = await page.evaluate(() => JSON.parse(localStorage.getItem("skee.wallet")));
  check((run.extraTickets ?? 0) === tix, `the run starts with the deal's +${tix} tickets (${run.extraTickets})`);
  const left = nights - 1;
  check(left === 0 ? !JSON.stringify(w.comps).includes("nights") : JSON.stringify(w.comps).includes(`"nights":${left}`), `one night used, ${left} left: ` + JSON.stringify(w.comps));
  dealt = null;
}

// The desktop: AI chat off. Nothing is sent; only DEAL or LEAVE.
async function quietHost(page, name, touch) {
  const sent = (await mockLog()).length;
  await press(page, "TapHostConsent(false)", touch);
  const t = await waitText(page, (t) => t.includes("AI chat is off"), "AI chat off");
  check(t.includes("AI CHAT IS OFF") && t.includes("LEAVE"), "only DEAL or LEAVE");
  const m = await marks(page);
  check(!m.live.includes("TapHostSend") && m.live.includes("TapHostDeal"), "SAY is off");
  check((await page.$eval("#host-draft", (e) => e.disabled)), "the field is disabled");
  check((await mockLog()).length === sent, "nothing reached the relay");
  await shot(page, name, "4b", "host-off");
  await press(page, "TapHostDeal", touch);
  await waitText(page, (t) => t.includes("DEAL!"), "the deal");
}

async function run(browser, name, viewport, touch) {
  console.log(`--- ${name} ${viewport.width}x${viewport.height}`);
  const page = await browser.newPage();
  const errors = [];
  const expected = (t) => forced > 0 && /status of 429/.test(t);
  page.on("console", (m) => { if ((m.type() === "error" || m.type() === "warning") && !expected(m.text())) errors.push(`${m.type()}: ${m.text()}`); });
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("response", (r) => {
    if (r.status() === 429 && r.url().endsWith("/skee-host/chat") && forced > 0) return;
    if (r.status() >= 400) errors.push(`http ${r.status()}: ${r.url()}`);
  });
  await page.setViewport(viewport);
  await page.goto(url, { waitUntil: "load" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await sleep(900);

  await shows(page, ["SKEE", "TAP TO PLAY", "THE BOARDWALK ARCADE", "PRIZE SHOP · 0", "HOW TO PLAY", "BOARDWALK", "PENTHOUSE"], "title");
  const idle = await rewrites(page, 1000);
  check(idle === 0, `an idle title rewrites no pane (${idle} mutations in 1 s)`);
  await shot(page, name, 1, "title");

  await press(page, "TapOpenShop", touch);
  await waitFor(page, (m) => m.layer === "LayerShop", "the shop");
  await shows(page, ["PRIZE SHOP", "0 WINNINGS", "Gold Star Sticker", "Rubber Duck", "BACK"], "shop");
  const under = await marks(page);
  check(!under.live.includes("TapStart"), "the title under the shop is not tappable");
  await shot(page, name, 2, "shop");
  await press(page, "TapCloseShop", touch);
  await waitFor(page, (m) => m.layer === "LayerBase", "back on the title");

  await press(page, "TapStart", touch);
  await waitFor(page, (m) => m.layer === "LayerArrival", "Sal");
  await shows(page, ["WELCOME TO", "SKEE SKEE SKEE", "SAL", "Well, look who walked in!", "GO ON"], "arrival");
  await shot(page, name, 3, "sal");
  for (let i = 0; i < 5; i++) await press(page, "TapArrivalNext", touch);
  await waitFor(page, (m) => m.layer === "LayerHost", "the first host");
  await shows(page, ["TALK TO AN AI HOST?", "YES, USE THE AI", "NO, KEEP IT ON MY PHONE"], "the AI chat card");
  const card = await marks(page);
  check(!card.live.includes("TapHostDeal") && card.live.includes("TapHostConsent(true)"), "the card covers the table");
  await shot(page, name, 4, "host-ask");
  if (touch) await liveHost(page, name, touch); else await quietHost(page, name, touch);
  await press(page, "TapCloseHost", touch);
  await waitFor(page, (m) => m.layer === "LayerCoachBlock", "the first coach card");
  await shows(page, ["YOUR FIRST LOADOUT", "SKIP", "GOT IT"], "coach");
  await shot(page, name, 5, "coach");
  await press(page, "TapSkipWalkthrough", touch);
  let m = await waitFor(page, (m) => m.layer === "LayerBase" && m.busy === "0" && m.live.includes("TapPull"), "the machine");
  await dealInRun(page);
  await shows(page, ["ANTE 1/8", "WARM-UP", "SPIN", "FRAME 1/3 · 9 BALLS", "NEW GAME", "GUIDE"], "machine");
  await shot(page, name, 6, "machine");

  await press(page, "TapOpenGuide", touch);
  await waitFor(page, (m) => m.layer === "LayerGuide", "the guide");
  await shows(page, ["THE GUIDE", "The Big Idea", "PLAY THE FIRST LOADOUT AGAIN", "DONE"], "guide");
  await shot(page, name, 7, "guide");
  await press(page, "Topic(0)", touch);
  await shows(page, ["THE BIG IDEA", "PAGE 1 OF 3", "NEXT"], "guide page 1");
  await press(page, "PageNext", touch);
  await shows(page, ["PAGE 2 OF 3"], "guide page 2");
  await shot(page, name, 8, "guide-page");
  await press(page, "PageBack", touch);
  await press(page, "PageBack", touch);
  await shows(page, ["THE GUIDE"], "back to the topics");
  await press(page, "TapCloseGuide", touch);
  await waitFor(page, (m) => m.layer === "LayerBase", "the game again");

  await press(page, "TapPull", touch);
  m = await waitFor(page, (m) => m.canThrow === "1" && m.busy === "0", "a throw after the pull", 15000);
  await shows(page, ["TARGETS", "thumb down on your line"], "after the pull");
  const fps = await page.evaluate(() => new Promise((res) => {
    let n = 0; const t0 = performance.now();
    const f = () => { n++; if (performance.now() - t0 < 1000) requestAnimationFrame(f); else res(n); };
    requestAnimationFrame(f);
  }));
  check(fps >= 40, `frames with the HUD up: ${fps} in 1 s`);
  await shot(page, name, 9, "game");
  await flick(page, viewport.width, viewport.height, m.crease, touch);
  await sleep(80);
  const thrown = await marks(page);
  check(thrown.canThrow === "0", "a flick on the lane under the HUD throws");
  await sleep(700);
  await shot(page, name, 10, "rolling");
  await waitFor(page, (m) => m.busy === "0", "the ball to settle", 20000);
  await shot(page, name, 11, "settled");

  const tip = await marks(page);
  if (tip.live.includes("TapGotIt")) {
    await shows(page, ["GOT IT"], "a tip card after the ball");
    await shot(page, name, 12, "tip");
    await press(page, "TapGotIt", touch);
    await waitFor(page, (m) => m.live.includes("TapAskNewGame"), "the tip card read");
  }
  await press(page, "TapAskNewGame", touch);
  await waitFor(page, (m) => m.layer === "LayerConfirmNew", "the new game prompt");
  await shows(page, ["START A NEW GAME?", "KEEP PLAYING"], "prompt");
  await shot(page, name, 13, "prompt");
  await press(page, "TapKeepPlaying", touch);
  await waitFor(page, (m) => m.layer === "LayerBase", "kept playing");
  await page.close();
  return errors;
}

await mockPost("/mock/reset");
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });
try {
  const phone = await run(browser, "phone", { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true }, true);
  const desk = await run(browser, "desktop", { width: 1280, height: 800, deviceScaleFactor: 1 }, false);
  for (const [n, errs] of [["phone", phone], ["desktop", desk]]) {
    errs.length === 0 ? ok(`${n}: console clean`) : fail(`${n}: console:\n  ` + errs.join("\n  "));
  }
} finally {
  await browser.close();
}
console.log(failures === 0 ? "HUD PLAYTEST PASS" : `HUD PLAYTEST FAIL (${failures})`);
process.exit(failures === 0 ? 0 : 1);
