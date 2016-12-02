/* global
ctx bullets
*/

function shoot (obj, vel, ang) {
  var ax = Math.cos(ang);
  var ay = Math.sin(ang);
  bullets.push([
    obj[0] + 14 * ax,
    obj[1] + 14 * ay,
    obj[2] + vel * ax,
    obj[3] + vel * ay,
    1000,
    0
  ]);
}

// RENDERING


function drawBullet () {
  ctx.globalAlpha = 1 - Math.random()*Math.random();
  ctx.fillStyle = "#00f";
  ctx.beginPath();
  ctx.arc(0, 0, 2+2.5*Math.random(), 0, 2*Math.PI);
  ctx.fill();
}
