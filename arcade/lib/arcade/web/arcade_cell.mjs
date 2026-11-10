// arcade_cell.mjs: the shell's one mutable cell, for Arcade.Web.Cell (march
// copies this file beside the build). It holds whatever March value the shell
// puts, so that event callbacks and the frame loop see the same state.
let cell = null;
export function cell_put(v) { cell = v; }
export function cell_get() { return cell; }
