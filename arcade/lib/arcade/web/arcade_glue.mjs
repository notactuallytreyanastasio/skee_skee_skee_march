// arcade_glue.mjs: the browser calls a game's shell needs that March's stdlib
// (Js.Dom, Js.Canvas) does not have. Each export is one platform call with no
// game logic; Arcade.Web.Glue declares them as externs, and march copies this
// file beside the build. Values cross in March's JS shapes: tuples
// { _0, _1, ... }, closures called as f._0(f, args...).

// ---- One clock, in seconds: performance.now() / 1000. rAF's time and every
// pointer event's timeStamp are on it (both are DOMHighResTimeStamps from
// the time origin).
export function glue_now() { return performance.now() / 1000; }

export function glue_request_frame(cb) {
  requestAnimationFrame((ms) => { cb._0(cb, ms / 1000); });
}

// ---- The window ----
export function glue_view_size() {
  return { _0: window.innerWidth, _1: window.innerHeight };
}
export function glue_device_pixel_ratio() { return window.devicePixelRatio || 1; }

// Backing store at device pixels, laid out at CSS pixels.
export function glue_size_canvas(canvas, w, h, dpr) {
  const bw = Math.max(1, Math.round(w * dpr)), bh = Math.max(1, Math.round(h * dpr));
  if (canvas.width !== bw) canvas.width = bw;
  if (canvas.height !== bh) canvas.height = bh;
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
}

// Two random 32-bit limbs for the launch seed.
export function glue_seed_limbs() {
  const a = new Uint32Array(2);
  crypto.getRandomValues(a);
  return { _0: a[0], _1: a[1] };
}

export function glue_on_visibility(cb) {
  document.addEventListener("visibilitychange", () => {
    cb._0(cb, document.visibilityState === "visible");
  });
}

export function glue_vibrate(ms) {
  try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { }
}

// ---- Read-only state for tests and the playtest: data-* on <html> ----
export function glue_mark(name, value) {
  const el = document.documentElement;
  if (el.getAttribute(name) !== value) el.setAttribute(name, value);
}
