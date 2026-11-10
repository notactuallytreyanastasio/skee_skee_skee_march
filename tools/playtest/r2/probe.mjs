import { launch, open, PHONE, sleep } from "../lib.mjs";
const url = "http://127.0.0.1:8161/";
const b = await launch();
const g = await open(b, url, PHONE, { });
const out = (p) => g.marks().then((m) => console.log(p, JSON.stringify({ ...m, text: m.text.slice(0, 300) })));
await out("boot");
await g.shot("/Users/bobdawg/code/skee_skee_skee_march/tools/playtest/r2/p-01-title.png");
for (let i = 0; i < 25; i++) {
  const m = await g.marks();
  const pick = ["TapStart", "TapNextLine", "TapSalNext", "TapCloseHost", "TapGotIt"].find((x) => m.live.includes(x)) || m.live.find((x)=>!/Guide|Shop|Settings|Room|Skip|Mute/.test(x));
  if (!pick) break;
  if (m.can === "1" || m.live.includes("TapPull")) break;
  console.log("press", pick); await g.press(pick); await sleep(300); await out("  ");
  await g.shot(`/Users/bobdawg/code/skee_skee_skee_march/tools/playtest/r2/p-02-${String(i).padStart(2,"0")}.png`);
}
console.log("errors", g.errors);
await b.close();
