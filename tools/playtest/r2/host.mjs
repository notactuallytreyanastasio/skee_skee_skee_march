import { launch, open, PHONE, sleep } from "../lib.mjs";
const w = JSON.stringify({ balance: 1600, comps: [], gamesSinceHost: 3, hostVisits: 0, lifetime: 1600, owned: [], progressive: { meters: ["mini", 50, "minor", 150, "major", 600, "grand", 2500] }, room: "boardwalk", rooms: ["boardwalk"] });
const b = await launch(); const g = await open(b, "http://127.0.0.1:8161/", PHONE, { "skee.arrivalDone": "true", "skee.walkthroughDone": "true", "skee.wallet": w });
let m = await g.marks(); console.log("title: " + m.live + " | " + m.text.slice(-120)); await g.shot("/Users/bobdawg/code/skee_skee_skee_march/tools/playtest/r2/shots/host-1-title.png");
await g.press("TapOpenHost"); m = await g.marks(); console.log("open host: " + m.layer + " " + m.live + " | " + m.text.slice(-260)); await g.shot("/Users/bobdawg/code/skee_skee_skee_march/tools/playtest/r2/shots/host-2-placeholder.png");
await g.press("TapCloseHost"); m = await g.marks(); console.log("closed: " + m.layer + " " + m.live);
await g.press("TapStart"); m = await g.marks(); console.log("start: " + m.layer + " " + m.live);
if (m.live.includes("TapCloseHost")) { await g.press("TapCloseHost"); m = await g.marks(); console.log("closed->: " + m.layer + " " + m.live + " | " + m.text.slice(0, 100)); }
console.log("errors " + JSON.stringify(g.errors)); await b.close();
