import { launch, open, sleep, PHONE } from "./lib.mjs";
const b = await launch(); const { page } = await open(b, PHONE);
console.log(await page.evaluate(() => {
  const w = document.createTreeWalker(document.getElementById("hud"), NodeFilter.SHOW_TEXT); const out = [];
  while (w.nextNode()) { const t = w.currentNode.textContent.trim(); if (/^(BAR|7)$/.test(t)) { const e = w.currentNode.parentElement; const r = e.getBoundingClientRect(); out.push(t + " <" + e.tagName + " " + e.outerHTML.slice(0, 80) + "> rect " + [r.x, r.y, r.width, r.height].map(Math.round) + " vis " + getComputedStyle(e).visibility + " anc " + e.closest("svg,[id]")?.id); } }
  return out.join("\n");
}));
await b.close();
