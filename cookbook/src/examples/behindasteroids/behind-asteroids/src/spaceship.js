/* global
ctx t path lifes play Alost AIboostSmoothed dying:true deads:true achievements killSmoothed:true
*/

function spaceshipDie() {
  if (dying) return;
  dying = t;
  if (lifes == 1) {
    play(Alost);
  }
  deads ++;
  achievements[1] ++;
  killSmoothed ++;
}

/*
function resetSpaceship () {
  var x = W * (0.25 + 0.5 * Math.random());
  var y = H * (0.25 + 0.5 * Math.random());
  spaceship = [x, y, 0, 0];
}
*/

// RENDERING

function drawSpaceship (o) {
  ctx.strokeStyle = "#f00";
  ctx.globalAlpha = 0.4;
  ctx.rotate(o[4]);
  if (dying) {
    ctx.lineWidth = 2;
    var delta = (t-dying)/200;

    path([
      [-6, -6 - 0.5*delta],
      [3, -3 - 0.9*delta]
    ]);
    ctx.stroke();

    if (delta < 8) {
      path([
        [3 + 0.4*delta, -3 - 0.8*delta],
        [12 + 0.4*delta, 0 - 0.5*delta]
      ]);
      ctx.stroke();
    }

    path([
      [12, 0+0.4*delta],
      [3, 3+delta]
    ]);
    ctx.stroke();

    if (delta < 9) {
      path([
        [1, 5 + delta],
        [-6, 6 + delta]
      ]);
      ctx.stroke();
    }

    if (delta < 7) {
      path([
        [-6 - delta, -6],
        [-6 - delta, 6]
      ]);
      ctx.stroke();
    }
  }
  else {
    path([
      [-6, -6],
      [ 12, 0],
      [ -6, 6],
      [ -5, 0]
    ]);
    ctx.stroke();
    if (AIboostSmoothed>0.2) {
      path([
        [-7, 2*Math.random()-1],
        [-7 - 5*AIboostSmoothed, 4*Math.random()-2]
      ]);
      ctx.stroke();
    }
    if (AIboostSmoothed<-0.2) {
      path([
        [2, -5],
        [2 - 5 * AIboostSmoothed, -7],
        ,
        [2, 5],
        [2 - 5 * AIboostSmoothed, 7]
      ]);
      ctx.stroke();
    }
  }
}
