// arcade_input.mjs: pointer and tap input for Arcade.Web.Input (march copies
// this file beside the build). Platform calls only. Values cross in March's
// JS shapes: tuples { _0, _1, ... }, lists as Cons/Nil, closures called as
// f._0(f, args...).

const NIL = { $: "Nil" };

function listOf(arr) {
  let l = NIL;
  for (let i = arr.length - 1; i >= 0; i--) l = { $: "Cons", _0: arr[i], _1: l };
  return l;
}

// ---- The thumb ----
// One pointer at a time: the first pointer down is followed until it lifts
// or is cancelled; others are ignored. down, move and up get lists of
// (t, x, y) triples: seconds and CSS pixels in the canvas. move and up
// include the coalesced samples. cancel(0) when the pointer is lost.
export function input_on_pointer(canvas, down, move, up, cancel) {
  let active = null;
  const sample = (e) => {
    const r = canvas.getBoundingClientRect();
    return { _0: e.timeStamp / 1000, _1: e.clientX - r.left, _2: e.clientY - r.top };
  };
  const samples = (e) => {
    const all = (typeof e.getCoalescedEvents === "function") ? e.getCoalescedEvents() : [];
    return listOf((all.length > 0 ? all : [e]).map(sample));
  };
  canvas.addEventListener("pointerdown", (e) => {
    if (active !== null) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    active = e.pointerId;
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { }
    e.preventDefault();
    down._0(down, listOf([sample(e)]));
  });
  canvas.addEventListener("pointermove", (e) => {
    if (e.pointerId !== active) return;
    e.preventDefault();
    move._0(move, samples(e));
  });
  canvas.addEventListener("pointerup", (e) => {
    if (e.pointerId !== active) return;
    active = null;
    e.preventDefault();
    up._0(up, samples(e));
  });
  const lost = (e) => {
    if (e.pointerId !== active) return;
    active = null;
    cancel._0(cancel, 0);
  };
  canvas.addEventListener("pointercancel", lost);
  canvas.addEventListener("lostpointercapture", lost);
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());
}

// ---- Taps queued by DOM buttons, drained once a frame ----
const taps = [];
export function input_queue_tap(i) { taps.push(i); }
export function input_drain_taps() { return listOf(taps.splice(0, taps.length)); }
