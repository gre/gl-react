/* global ctx */

function path (pts, noclose) { // eslint-disable-line no-unused-vars
  ctx.beginPath();
  var mv = 1;
  for (var i = 0; pts && i<pts.length; ++i) {
    var p = pts[i];
    if (p) {
      if (mv) ctx.moveTo(p[0], p[1]);
      else ctx.lineTo(p[0], p[1]);
      mv = 0;
    }
    else mv = 1;
  }
  if (!noclose) ctx.closePath();
}
