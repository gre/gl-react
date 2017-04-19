/* global
ctx path W H asteroids:true rotatingLetters incPosition incRotation MOBILE play
Asend AsendFail
*/

// Logic

function randomAsteroidShape (lvl) {
  var n = 4 + lvl * 2;
  var size = lvl * 10;
  var pts = [];
  for (var i = 0; i < n; ++i) {
    var l = size*(0.4 + 0.6 * Math.random());
    var a = 2 * Math.PI * i / n;
    pts.push([
      l * Math.cos(a),
      l * Math.sin(a)
    ]);
  }
  return pts;
}

function randomAsteroids () {
  asteroids = [];
  for (var i=0; i<8; ++i) {
    var lvl = Math.floor(1.5 + 3 * Math.random());
    asteroids[i] = [
      W * Math.random(),
      H * Math.random(),
      2 * Math.PI * Math.random(),
      0.02 + 0.02 * Math.random(),
      randomAsteroidShape(lvl),
      lvl
    ];
  }
}


function explodeAsteroid (j) {
  var aster = asteroids[j];
  asteroids.splice(j, 1);
  var lvl = aster[5];
  if (lvl > 1) {
    var nb = Math.round(2+1.5*Math.random());
    for (var k=0; k<nb; k++) {
      var a = Math.random() + 2 * Math.PI * k / nb;
      asteroids.push([
        aster[0] + 10 * Math.cos(a),
        aster[1] + 10 * Math.sin(a),
        a,
        0.5 * aster[3],
        randomAsteroidShape(lvl-1),
        lvl - 1
      ]);
    }
  }
}

function sendAsteroid (o) {
  rotatingLetters.push(o[7]);
  if (Math.abs(Math.cos(o[2])) < o[9]) {
    var p = incPosition(o);
    var rot = incRotation(o);
    var x = Math.max(0, Math.min(p[0], W));
    var y = Math.max(0, Math.min(p[1], H));
    var vel = (MOBILE ? 0.006 : 0.008) * o[3];
    var lvl = o[6];
    var shape = o[5];
    asteroids.push([ x, y, rot, vel, shape, lvl ]);
    play(Asend);
    return 1;
  }
  else {
    play(AsendFail);
  }
}

/*
function randomInGameAsteroid () {
  var a = Math.random() < 0.5;
  var b = Math.random() < 0.5;
  var lvl = Math.floor(1 + 2 * Math.random() * Math.random());
  asteroids.push([
    a ? (b?-20:W+20) : W * Math.random(),
    !a ? (b?-20:H+20) : H * Math.random(),
    2 * Math.PI * Math.random(),
    0.02 + 0.02 * Math.random(),
    randomAsteroidShape(lvl),
    lvl
  ]);
}
*/


// RENDERING

function drawAsteroid (o) {
  ctx.globalAlpha = 0.2;
  ctx.strokeStyle = "#f00";
  path(o[4]);
  ctx.stroke();
}
