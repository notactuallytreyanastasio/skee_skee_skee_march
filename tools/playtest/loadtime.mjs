// Cold load: navigation to first painted frame (data-layer set) and to fonts ready,
// unthrottled and on a simulated fast-4G link (served uncompressed by tools/serve).
import { launch, sleep, PHONE } from "./lib.mjs";
const url = process.argv[2] || "http://127.0.0.1:8161/";
const b = await launch();
for (const [name, cond] of [["local", null], ["fast4g", { offline: false, latency: 85, downloadThroughput: 9e6 / 8, uploadThroughput: 1.5e6 / 8 }], ["slow4g", { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 0.75e6 / 8 }]]) {
  const page = await b.newPage(); await page.setViewport(PHONE);
  const cdp = await page.createCDPSession();
  await cdp.send("Network.enable"); await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  if (cond) await cdp.send("Network.emulateNetworkConditions", cond);
  let bytes = 0; cdp.on("Network.loadingFinished", (e) => { bytes += e.encodedDataLength; });
  const t0 = Date.now();
  await page.goto(url, { waitUntil: "load", timeout: 120000 });
  const tl = Date.now() - t0;
  await page.waitForFunction(() => document.documentElement.getAttribute("data-layer"), { timeout: 120000 });
  const tf = Date.now() - t0;
  await page.evaluate(() => document.fonts.ready);
  const tfont = Date.now() - t0;
  const heap = await page.evaluate(() => performance.memory ? (performance.memory.usedJSHeapSize / 1e6).toFixed(1) + "MB" : "?");
  console.log(`${name}: load event ${tl}ms, first frame ${tf}ms, fonts ${tfont}ms, transferred ${(bytes / 1e6).toFixed(2)}MB, heap ${heap}`);
  await page.close();
}
await b.close();
