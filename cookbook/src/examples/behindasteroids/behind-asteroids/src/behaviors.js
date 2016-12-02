/* global dt W H */

function euclidPhysics (obj) {
  obj[0] += obj[2] * dt;
  obj[1] += obj[3] * dt;
}

function polarPhysics (obj) {
  var x = Math.cos(obj[2]);
  var y = Math.sin(obj[2]);
  var s = dt * obj[3];
  obj[0] += s * x;
  obj[1] += s * y;
}

function destroyOutOfBox (obj, i, arr) {
  if (obj[0] < -100 || obj[1] < -100 || obj[0] > W+100 || obj[1] > H+100) {
    arr.splice(i, 1);
  }
}

function applyLife (obj, i, arr) {
  if ((obj[4] -= dt) < 0) {
    arr.splice(i, 1);
  }
}

function loopOutOfBox (obj) {
  if (obj[0] < 0) {
    obj[0] += W;
  }
  else if (obj[0] > W) {
    obj[0] -= W;
  }
  if (obj[1] < 0) {
    obj[1] += H;
  }
  else if (obj[1] > H) {
    obj[1] -= H;
  }
}
