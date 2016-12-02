/* global
dt dying spaceship shoot ctx path
*/

function applyUFOlogic (o) {
  o[4] -= dt;
  if (o[4]<0) {
    o[4] = 500 + 300 * Math.random();
    if (!dying) {
      var target = Math.atan2(spaceship[1] - o[1], spaceship[0] - o[0]);
      if (!o[2] || Math.random()<0.2) {
        var randomAngle = 2*Math.PI*Math.random();
        o[2] = 0.08 * Math.cos(randomAngle);
        o[3] = 0.08 * Math.sin(randomAngle);
      }
      shoot(o, 0.3+0.1*Math.random(), target + 0.6 * Math.random() - 0.3);
    }
  }
}

// RENDERING

var UFOa = [
  [8,0],
  [7,5],
  [0,9],
  [7,14]
];
var UFOb = [
  [15,14],
  [22,9],
  [15,5],
  [14,0]
];

var UFO =
  UFOa
  .concat(UFOb)
  .concat(UFOa)
  .concat([,])
  .concat(UFOb)
  .concat([
    ,
    [7,5],
    [15,5],
    ,
    [0,9],
    [22,9]
  ]);

function drawUFO () {
  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = "#f00";
  path(UFO);
  ctx.stroke();
}
