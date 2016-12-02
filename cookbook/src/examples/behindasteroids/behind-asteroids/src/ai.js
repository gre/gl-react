/* global
DEBUG
AIrotate: true
AIboost: true
AIshoot: true
AIexcitement: true
spaceship
t dt
asteroids
bullets
W H
dist normAngle
ufos
playingSince
ctx
*/

/*
if (DEBUG) {
  /* eslint-disable no-inner-declarations
  var AIdebug = [], AIdebugCircle = [];
  function drawAIDebug () {
    AIdebug.forEach(function (debug, i) {
      ctx.save();
      ctx.lineWidth = 2;
      ctx.fillStyle = ctx.strokeStyle = "hsl("+Math.floor(360*i/AIdebug.length)+",80%,50%)";
      ctx.beginPath();
      ctx.moveTo(debug[0], debug[1]);
      ctx.lineTo(debug[2], debug[3]);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(debug[0], debug[1], 2, 0, 2*Math.PI);
      ctx.fill();
      ctx.restore();
    });
    AIdebugCircle.forEach(function (debug, i) {
      ctx.save();
      ctx.lineWidth = 2;
      ctx.fillStyle = ctx.strokeStyle = "hsl("+Math.floor(360*i/AIdebugCircle.length)+",80%,50%)";
      ctx.beginPath();
      ctx.arc(debug[0], debug[1], Math.max(0, debug[2] * debug[3]), 0, 2*Math.PI);
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(debug[0], debug[1], debug[3], 0, 2*Math.PI);
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(debug[2].toFixed(2), debug[0], debug[1]-debug[3]-2);
      ctx.restore();
    });
  }
  function clearDebug () {
    AIdebug = [];
    AIdebugCircle = [];
  }
  function addDebugCircle (p, value, radius) {
    AIdebugCircle.push([ p[0], p[1], value, radius ]);
  }
  function addDebug (p, v) {
    var d = 200;
    AIdebug.push([ p[0], p[1], p[0]+(v?d*v[0]:0), p[1]+(v?d*v[1]:0) ]);
  }
  function addPolarDebug (p, ang, vel) {
    var v = [
      vel * Math.cos(ang),
      vel * Math.sin(ang)
    ];
    addDebug(p, v);
  }
  /* eslint-enable
}
*/

var closestAsteroidMemory, targetShootMemory, closestAsteroidMemoryT, targetShootMemoryT;

// AI states
function aiLogic (smart) { // set the 3 AI inputs (rotate, shoot, boost)
  var i;

  // DEBUG && clearDebug();

  // first part is data extraction / analysis

  //var ax = Math.cos(spaceship[4]);
  //var ay = Math.sin(spaceship[4]);
  var vel = Math.sqrt(spaceship[2]*spaceship[2]+spaceship[3]*spaceship[3]);
  var velAng = Math.atan2(spaceship[3], spaceship[2]);

  //var spaceshipVel = [ ax * vel, ay * vel ];


  // utilities

  function orient (ang) {
    var stableAng = normAngle(ang - spaceship[4]);
    AIrotate = stableAng < 0 ? -1 : 1;
    return stableAng;
  }

  function move (ang, vel) {
    var stableAng = normAngle(ang - spaceship[4]);
    var abs = Math.abs(stableAng);
    if (abs > Math.PI/2) {
      if (vel) AIboost = abs>Math.PI/2-0.4 ? vel>0?-1:1 : 0;
      AIrotate = stableAng > 0 ? -1 : 1;
    }
    else {
      if (vel) AIboost = abs<0.4 ? vel<0?-1:1 : 0;
      AIrotate = stableAng < 0 ? -1 : 1;
    }
  }

  // take actions to move and stabilize to a point
  function moveToPoint (p, minDist) {
    var dx = p[0]-spaceship[0];
    var dy = p[1]-spaceship[1];
    if (dx*dx+dy*dy<minDist*minDist) return;
    var tx = dx / 800;
    var ty = dy / 800;
    var x = tx - spaceship[2];
    var y = ty - spaceship[3];
    var ang = Math.atan2(y, x);
    var dist = length([x, y]);
    move(ang, dist);
  }

  function dot (a,b) { // dot product
    return a[0]*b[0] + a[1]*b[1];
  }

  // a line defined by AB, point is P
  function projectPointToLine (p, a, ab) {
    var ap = [ p[0]-a[0], p[1]-a[1] ];
    var k = dot(ap,ab)/dot(ab,ab);
    return [
      a[0] + k * ab[0],
      a[1] + k * ab[1]
    ];
  }

  function moveAwayFromPoint (p, v) {
    var spaceshipToP = [
      p[0] - spaceship[0],
      p[1] - spaceship[1]
    ];
    var ang = Math.atan2(spaceshipToP[1], spaceshipToP[0]);
    var dist = length(spaceshipToP);
    // DEBUG && addPolarDebug(p, ang, 0.5);

    if (v && vel > 0.003 * dist && Math.abs(normAngle(ang - velAng))<Math.PI/3) {
      // if there is some velocity, it is still good to "traverse" the point and not brake
      // but we need to target a bit more far from the obj vel
      var l = length(v);
      spaceshipToP[0] += 100 * v[0]/l;
      spaceshipToP[1] += 100 * v[1]/l;
      ang = Math.atan2(spaceshipToP[1], spaceshipToP[0]);
      move(ang, 1);
    }
    else {
      move(ang, -1);
    }
  }

  // danger have [ x, y, rot, vel ]
  function moveAwayFromAsteroid (ast) {
    var v = [
      ast[3] * Math.cos(ast[2]),// - spaceshipVel[0],
      ast[3] * Math.sin(ast[2])// - spaceshipVel[1]
    ];
    var p = projectPointToLine(spaceship, ast, v);
    var acceptDist = 30 + 10 * ast[5];
    var d = dist(p, spaceship);
    if (d > acceptDist) return;
    //DEBUG && addDebug(p, v);
    moveAwayFromPoint(p, v);
  }

  function predictShootIntersection (bulletVel, pos, target, targetVel) {
    // http://gamedev.stackexchange.com/a/25292
    var totarget = [
      target[0] - pos[0],
      target[1] - pos[1]
    ];
    var a = dot(targetVel, targetVel) - bulletVel * bulletVel;
    var b = 2 * dot(targetVel, totarget);
    var c = dot(totarget, totarget);
    var p = -b / (2 * a);
    var q = Math.sqrt((b * b) - 4 * a * c) / (2 * a);
    var t1 = p - q;
    var t2 = p + q;
    var t = t1 > t2 && t2 > 0 ? t2 : t1;

    return [t, [
      target[0] + targetVel[0] * t,
      target[1] + targetVel[1] * t
    ]];
  }

  var middle = [W/2,H/2];

  var closestAsteroid, targetShoot, danger = 0;
  var closestAsteroidScore = 0.3, targetShootScore = 0.1;
  var incomingBullet, incomingBulletScore = 0;

  for (i = 0; i < asteroids.length; ++i) {
    var ast = asteroids[i];
    // FIXME: take velocity of spaceship into account?
    var v = [
      ast[3] * Math.cos(ast[2]),
      ast[3] * Math.sin(ast[2])
    ];
    var timeBeforeImpact = dot([ spaceship[0]-ast[0], spaceship[1]-ast[1] ],v)/dot(v,v);
    var impact = [
      ast[0] + timeBeforeImpact * v[0],
      ast[1] + timeBeforeImpact * v[1]
    ];
    var distToImpact = dist(spaceship, impact);
    var distWithSize = distToImpact - 10 - 10 * ast[5];

    var score =
      Math.exp(-distWithSize/40) +
      Math.exp(-distWithSize/120) +
      timeBeforeImpact > 0 ? Math.exp(-timeBeforeImpact/1000) : 0;

    if (score > closestAsteroidScore) {
      closestAsteroidScore = score;
      closestAsteroid = ast;
      danger ++;
    }

    score =
      Math.exp(-(ast[5]-1)) *
      Math.exp(-distWithSize/200);

    if (score > targetShootScore) {
      var res = predictShootIntersection(0.3, spaceship, ast, v);
      var t = res[0];
      var p = res[1];
      if (0<p[0] && p[0]<W && 0<p[1] && p[1]<H && t<800) {
        targetShoot = p;
        targetShootScore = score;
        //DEBUG && addDebugCircle(p, score, 20);
      }
    }

  }

  for (i = 0; i < bullets.length; ++i) {
    var b = bullets[i];
    v = b.slice(2);
    timeBeforeImpact = dot([ spaceship[0]-b[0], spaceship[1]-b[1] ],v)/dot(v,v);
    impact = [
      b[0] + timeBeforeImpact * v[0],
      b[1] + timeBeforeImpact * v[1]
    ];
    distToImpact = dist(spaceship, impact);
    score = Math.exp(-timeBeforeImpact/1000) + 2*Math.exp(-distToImpact/50);
    if (100 < timeBeforeImpact &&
      timeBeforeImpact < 1000 &&
      distToImpact < 40 &&
      score > incomingBulletScore) {
      incomingBulletScore = score;
      incomingBullet = impact;
    }
  }

  for (i = 0; i < ufos.length; ++i) {
    var u = ufos[i];
    res = predictShootIntersection(0.3, spaceship, u, u.slice(2));
    t = res[0];
    p = res[1];
    targetShoot = p;
  }

  AIexcitement =
    (1 - Math.exp(-asteroids.length/10)) + // total asteroids
    (1 - Math.exp(-danger/3)) // danger
  ;

  // Now we implement the spaceship reaction
  // From the least to the most important reactions

  // Dump random changes

  AIshoot = playingSince > 3000 && Math.random() < 0.001*dt*(1-smart);

  AIrotate = (playingSince > 1000 && Math.random()<0.002*dt) ?
    (Math.random()<0.6 ? 0 : Math.random() < 0.5 ? -1 : 1) : AIrotate;

  AIboost = (playingSince > 2000 && Math.random()<0.004*dt) ?
    (Math.random()<0.7 ? 0 : Math.random() < 0.5 ? -1 : 1) : AIboost;

  // Stay in center area

  if (0.1 + smart > Math.random()) moveToPoint(middle, 30);

  // Shot the target

  if (smart > Math.random()) {
    if (targetShoot) {
      AIshoot =
        Math.abs(orient(Math.atan2(
          targetShoot[1] - spaceship[1],
          targetShoot[0] - spaceship[0]))) < 0.1 &&
        Math.random() < 0.04 * dt;
      targetShootMemory = targetShoot;
      targetShootMemoryT = t;
    }
    else {
      AIshoot = 0;
    }
  }

  // Avoid dangers
  if (smart > Math.random()) {
    if (closestAsteroid) {
      moveAwayFromAsteroid(closestAsteroid);
      closestAsteroidMemory = closestAsteroid;
      closestAsteroidMemoryT = closestAsteroid;
    }

    if (incomingBullet) moveAwayFromPoint(incomingBullet);
  }

  //DEBUG && targetShoot && addPolarDebug(targetShoot, 0, 0);
  //DEBUG && closestAsteroid && addPolarDebug(closestAsteroid, closestAsteroid[2], closestAsteroid[3]);
}
