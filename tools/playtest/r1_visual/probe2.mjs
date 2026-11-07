import { launch, open, sleep, PHONE } from "./lib.mjs";
// Render one offer card's DOM statically: copy the counter markup from a live page is hard, so measure the CSS on a synthetic card
const b = await launch(); const { page } = await open(b, PHONE);
console.log(await page.evaluate(() => {
  const hud = document.getElementById("hud");
  const d = document.createElement("div"); d.className = "offers"; d.style.cssText = "position:absolute;left:20px;top:200px;width:350px;z-index:99";
  d.innerHTML = `<div class="offer" style="background:#fff"><div class="offer-icon"></div><div class="offer-words"><span class="plain">Even Steven</span><div class="offer-blurb"><span style="font-size:11px;font-weight:600">x2 mult if all three balls hit the same hole</span></div><div class="grow"></div><span>6 TIX</span></div></div><div class="offer"></div>`;
  hud.appendChild(d);
  const bl = d.querySelector(".offer-blurb"), sp = bl.firstChild; const cs = getComputedStyle(bl), ss = getComputedStyle(sp);
  return JSON.stringify({ blurb: [bl.clientWidth, bl.clientHeight, bl.scrollHeight], lineH: cs.lineHeight, spanLH: ss.lineHeight, spanDisplay: ss.display, font: ss.fontSize, offer: getComputedStyle(d.querySelector(".offer")).cssText.length });
}));
await page.screenshot({ path: "shots/probe-offer.png", clip: { x: 0, y: 180, width: 390, height: 200 } });
await b.close();
