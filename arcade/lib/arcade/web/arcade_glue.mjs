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

// ---- A DOM overlay's panes ----
// A pane rewritten under a text field would drop what was typed, the focus
// and the caret: this keeps all three for fields with an id.
export function glue_set_html_keeping(pane, html) {
  const active = document.activeElement;
  const focused = active && pane.contains(active) && active.id ? active.id : null;
  let caret = null;
  if (focused && typeof active.selectionStart === "number") caret = [active.selectionStart, active.selectionEnd];
  const values = new Map();
  for (const f of pane.querySelectorAll("input[id], textarea[id]")) values.set(f.id, f.value);
  pane.innerHTML = html;
  for (const [id, v] of values) {
    const f = document.getElementById(id);
    if (f && pane.contains(f)) f.value = v;
  }
  if (focused) {
    const f = document.getElementById(focused);
    if (f && pane.contains(f) && !f.disabled) {
      f.focus({ preventScroll: true });
      if (caret) { try { f.setSelectionRange(caret[0], caret[1]); } catch (e) { } }
    }
  }
}

// ---- One JSON POST ----
// reply((status, body)) when an HTTP answer came back, whatever its status;
// fail((timedOut, message)) when none did: timedOut when nothing came within
// timeoutMs, message the browser's words ("" when it gave none). The
// callbacks run outside the fetch's promise chain, so an error in the game is
// never reported as a network failure.
export function glue_post_json(url, body, timeoutMs, reply, fail) {
  let signal;
  try { signal = AbortSignal.timeout(timeoutMs); } catch (e) { signal = undefined; }
  fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    cache: "no-store",
    signal,
  }).then(
    (r) => r.text().then((text) => ({ ok: true, status: r.status, text }), (e) => ({ ok: false, e })),
    (e) => ({ ok: false, e }),
  ).then((res) => {
    if (res.ok) {
      reply._0(reply, { _0: res.status, _1: res.text });
    } else {
      const e = res.e;
      const timedOut = !!(e && e.name === "TimeoutError");
      const message = e && e.message ? String(e.message) : "";
      fail._0(fail, { _0: timedOut, _1: message });
    }
  });
}
