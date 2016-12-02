/* global
GAME_INC_PADDING W H t dt borderLength spaceship incomingObjects player
playingSince randomAsteroidShape lifes dying ctx path MOBILE font helpVisible
*/

function incPosition (o) {
  var i = o[0] % borderLength;
  var x, y;
  var w = W + GAME_INC_PADDING;
  var h = H + GAME_INC_PADDING;
  if (i<w) {
    x = i;
    y = 0;
  }
  else {
    i -= w;
    if (i < h) {
      x = w;
      y = i;
    }
    else {
      i -= h;
      if (i < w) {
        x = w - i;
        y = h;
      }
      else {
        i -= w;
        x = 0;
        y = h - i;
      }
    }
  }
  var p = [ -GAME_INC_PADDING/2 + x, -GAME_INC_PADDING/2 + y ];
  if (o[10]) {
    var dt = t - o[10];
    var a = Math.atan2(spaceship[1] - p[1], spaceship[0] - p[0]);
    var l = dt * 0.3;
    p[0] -= Math.cos(a) * l;
    p[1] -= Math.sin(a) * l;
  }
  return p;
}

function incRotationCenter (o) {
  var p = incPosition(o);
  var toCenter = Math.atan2(spaceship[1] - p[1], spaceship[0] - p[0]);
  return toCenter;
}

function incRotation (o) {
  return Math.cos(o[2]) * o[8] + incRotationCenter(o);
  //return o[2];
}

var nextCreate = 0;
function maybeCreateInc () {
  var sum = incomingObjects.reduce(function (sum, o) {
    return o[6];
  }, 0);
  // create inc is ruled with probabilities
  if (
    nextCreate < t &&
    Math.random() <
    0.01 * dt * // continous time probability
    Math.exp(-sum * // more there is object, more it is rare to create new ones
    (1 + 5 * Math.exp(-(player-1)/3) - 0.2 * Math.exp(-Math.abs(player-20)/20)) // first rounds have less items
    ) *
    (1 - Math.exp(-playingSince / 5000))
  ) {
    nextCreate = t + 1000 * (1 + Math.random());
    return createInc();
  }
}

var rotatingLetters = [];
for (var rotatingLettersI=0; rotatingLettersI<26; rotatingLettersI++)
  rotatingLetters.push(65+rotatingLettersI);
rotatingLetters.sort(function () {
  return Math.random()-0.5;
});

function createInc () {
  if (!rotatingLetters.length) return 0;
  var pos = Math.random() * borderLength;
  var key = rotatingLetters.shift();
  for (var i=0; i<incomingObjects.length; ++i) {
    var o = incomingObjects[i];
    var p = o[0] % borderLength;
    if (pos - 60 < p && p < pos + 60) return 0;
  }

  /*
  PARAMS to vary with game difficulty
  - higher rotation amplitude
  - lower rotation valid amp ratio
  - higher rotation speed
  */

  var diffMax = 1-Math.exp(-player/5);
  var diffMin = 1-Math.exp((1-player)/20);
  if (Math.random() > diffMax) diffMin *= Math.random();


  var pRotAmp = diffMin + Math.random() * (diffMax-diffMin);
  var pRotAmpRatio = diffMin + Math.random() * (diffMax-diffMin);
  var pRotSpeed = diffMin + Math.random() * (diffMax-diffMin);

  var lvl = Math.floor(2 + 3 * Math.random() * Math.random() + 4 * Math.random() * Math.random() * Math.random());
  var ampRot = player<2 ? 0 : Math.PI * (0.8 * Math.random() + 0.05 * lvl) * pRotAmp;
  if (ampRot < 0.2) ampRot = 0;
  var ampRotRatio =
    player > 2 &&
    ampRot > Math.exp(-player/4) &&
    Math.random() > 0.5 + 0.4 * ((player-3)%8)/8 - 0.5 * (1 - Math.exp(-player/10)) ?
    0.9  - 0.5 * pRotAmpRatio - 0.2 * pRotAmp :
    1;

  if (player == 2) {
    ampRot = 0.2 + Math.random();
  }

  if (player == 3) {
    ampRot = 0.2 + Math.random();
    ampRotRatio = 0.5 + 0.4 * Math.random();
  }

  incomingObjects.push([
    pos,
    // velocity
    0.1 + 0.002 * player,
    // initial angle
    2*Math.PI*Math.random(),
    // initial force
    10 + 40*Math.random(),
    // rot velocity
    0.002 + 0.001 * (Math.random() + 0.5 * lvl * Math.random() + Math.random() * player / 30) * pRotSpeed - 0.001 * pRotAmp,
    // shape
    randomAsteroidShape(lvl),
    // level
    lvl,
    // key
    key,
    // amplitude rotation
    ampRot,
    // amplitude rotation valid ratio
    ampRotRatio,
    // explode time
    0
  ]);
  return 1;
}

function applyIncLogic (o) {
  if (!o[10]) {
    o[0] += o[1] * dt;
    o[2] += o[4] * dt;
    o[3] = o[3] < 10 ? 60 : o[3] - 0.02 * dt;
  }
}

// RENDERING

function drawInc (o) {
  var rotC = incRotationCenter(o);
  var phase = Math.cos(o[2]);
  var rot = phase * o[8] + rotC;
  var w = 10 * o[6];
  var valid = Math.abs(phase) < o[9];

  if (playingSince>0 && lifes && !dying && !o[10]) {
    ctx.lineWidth = 1+o[3]/60;
    ctx.strokeStyle = valid ? "#7cf" : "#f66";

    if (o[8] > 0.1) {
      ctx.save();
      ctx.rotate(rotC);
      ctx.strokeStyle = "#f66";
      ctx.beginPath();
      ctx.arc(0, 0, w+10, -o[8], -o[8]*o[9]);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, w+10, o[8]*o[9], o[8]);
      ctx.stroke();
      ctx.strokeStyle = "#7cf";
      ctx.beginPath();
      ctx.arc(0, 0, w+10, -o[8] * o[9], o[8] * o[9]);
      ctx.stroke();
      path([
        [w+8, 0],
        [w+12, 0]
      ]);
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.rotate(rot);
    ctx.save();
    var mx = 60 + w;
    var x = o[3] + w;
    ctx.globalAlpha = 0.2;
    path([
      [0,0],
      [mx,0]
    ]);
    ctx.stroke();
    ctx.restore();
    path([
      [0,0],
      [x,0]
    ]);
    ctx.stroke();
    var r = 6;
    path([
      [ mx - r, r ],
      [ mx, 0],
      [ mx - r, -r ]
    ], 1);
    ctx.stroke();
    ctx.restore();
  }
  else {
    ctx.strokeStyle = o[10] ? "#f66" : "#999";
  }

  ctx.save();
  path(o[5]);
  ctx.fillStyle = "#000";
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  var sum = [0, 0];
  o[5].forEach(function (p) {
    sum[0] += p[0];
    sum[1] += p[1];
  });

  if (!MOBILE && playingSince>0) {
    if (helpVisible()) {
      ctx.strokeStyle = "#f7c";
    }
    ctx.translate(sum[0]/o[5].length+1, sum[1]/o[5].length-5);
    font(String.fromCharCode(o[7]), 1);
  }
}

function drawIncHelp () {
  if (!helpVisible()) return;
  ctx.strokeStyle = "#f7c";
  ctx.lineWidth = 4;
  incomingObjects.forEach(function (o) {
    var p = incPosition(o);
    ctx.beginPath();
    ctx.arc(p[0], p[1], 80 + 40 * Math.cos(0.005 * t), 0, 2*Math.PI);
    ctx.stroke();
  });
}
