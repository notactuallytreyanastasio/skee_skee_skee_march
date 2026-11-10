// arcade_canvas2d.mjs: the CanvasRenderingContext2D calls March's Js.Canvas
// does not have. Each export is one platform call; Arcade.Web.Canvas2d
// declares them as externs, and march copies this file beside the build.

export function canvas2d_set_transform(ctx, a, b, c, d, e, f) { ctx.setTransform(a, b, c, d, e, f); }
export function canvas2d_composite(ctx, op) { ctx.globalCompositeOperation = op; }
export function canvas2d_fill_rule(ctx, evenodd) { ctx.fill(evenodd ? "evenodd" : "nonzero"); }
export function canvas2d_clip_rule(ctx, evenodd) { ctx.clip(evenodd ? "evenodd" : "nonzero"); }
export function canvas2d_line_cap(ctx, cap) { ctx.lineCap = cap; }
export function canvas2d_line_join(ctx, join) { ctx.lineJoin = join; }
export function canvas2d_text_centred(ctx) { ctx.textAlign = "center"; ctx.textBaseline = "middle"; }
export function canvas2d_arc_full(ctx, x, y, r, sweep) { ctx.arc(x, y, r, 0, sweep); }
// The gradient being built: radial, its stops, then fill_gradient sets it.
let gradient = null;
export function canvas2d_radial(ctx, x0, y0, r0, x1, y1, r1) {
  gradient = ctx.createRadialGradient(x0, y0, Math.max(0, r0), x1, y1, Math.max(0, r1));
}
export function canvas2d_gradient_stop(at, css) { gradient.addColorStop(Math.min(1, Math.max(0, at)), css); }
export function canvas2d_fill_gradient(ctx) { ctx.fillStyle = gradient; }
