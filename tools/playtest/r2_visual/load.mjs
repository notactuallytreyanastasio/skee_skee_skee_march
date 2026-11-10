import { launch, open, shot, marks, text, sleep, PHONE, DESK, URL } from "./lib.mjs";
const b = await launch();
for (const [n, vp] of [["phone", PHONE], ["desk", DESK]]) {
  const page = await b.newPage(); await page.setViewport(vp);
  const log = []; page.on("console", (m) => log.push(`${m.type()}: ${m.text()}`)); page.on("pageerror", (e) => log.push("pageerror " + e.message));
  const t0 = Date.now();
  await page.goto(URL, { waitUntil: "load" });
  const tLoad = Date.now() - t0;
  // first frame with a layer mark
  while (!(await page.evaluate(() => document.documentElement.getAttribute("data-layer")))) await sleep(10);
  const tFirst = Date.now() - t0;
  const nav = await page.evaluate(() => { const e = performance.getEntriesByType("navigation")[0]; const r = performance.getEntriesByType("resource").map(x => [x.name.split("/").pop(), Math.round(x.duration), x.transferSize]); return { dcl: Math.round(e.domContentLoadedEventEnd), load: Math.round(e.loadEventEnd), r }; });
  console.log(n, "load", tLoad, "ms; first mark", tFirst, "ms", JSON.stringify(nav));
  await page.evaluate(() => document.fonts.ready); await sleep(800);
  console.log(await shot(page, `${n}-00-title`)); console.log(JSON.stringify(await marks(page))); console.log(await text(page));
  console.log(log.join("\n"));
}
await b.close();
