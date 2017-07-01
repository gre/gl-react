/* eslint-disable no-undef */
/* eslint-enable no-unused-vars */

randomAsteroids();
raf=requestAnimationFrame(render);

if (DEBUG) {
  /* eslint-disable */
/*
  // DEBUG the game over screen
  setTimeout(function () {
    playingSince = -1;
    awaitingContinue = 0;
    player = 42;
    achievements = [123, 45, 6];
    gameOver = 1;
  }, 1000);
*/
  // Debug the levels
  addEventListener("resize", function () {
    playingSince = -1;
    awaitingContinue = 0;
    player ++;
    incomingObjects = [];
    console.log("player=", player);
/*
    ufos.push([
      0, 0, 0, 0, 0
    ]);
    */

  });

/*
  setTimeout(function () {
    killSmoothed ++;
  }, 100);
  setTimeout(function () {
    killSmoothed ++;
  }, 2000);
  */

  // Debug the incomingObjects

/*
  setInterval(function () {
    createInc();
    if (incomingObjects[0]) sendAsteroid(incomingObjects[0]);
    incomingObjects.splice(0, 1);
  }, 800);
*/

  /* eslint-enable */
}

window._behindAsteroids_send = function () {
  createInc();
  if (incomingObjects[0]) sendAsteroid(incomingObjects[0]);
  incomingObjects.splice(0, 1);
};

// Game Render Loop

var _lastT, _lastCheckSize = -9999;
function render (_t) {
  raf=requestAnimationFrame(render);
  if (!_lastT) _lastT = _t;
  dt = Math.min(100, _t-_lastT);
  _lastT = _t;

  if (t-_lastCheckSize>200) checkSize();

  t += dt; // accumulate the game time (that is not the same as _t)

  // UPDATE game
  update();

  // RENDER game

  // Game rendering

  ctx = gameCtx;

  ctx.save();

  drawGame();

  ctx.restore();

  RENDER_CB();
}

// Game Update Loop

function update () {
  playingSince += dt;

  if (t-ufoMusicTime>1200) {
    ufoMusicTime = t;
    if (ufos[0])
      play(Aufo);
  }

  if(!gameOver && !awaitingContinue) {

    if (playingSince > 0 && !achievements) {
      achievements = [0,0,0];
    }

    var i;
    var nbSpaceshipBullets = 0;

    if (!dying && playingSince>0 && t-musicPaused>5000 && player > 2 && !ufos.length) {

      combosTarget = Math.floor(30 - 25 * Math.exp(-(player-3)/15));
      var musicFreq = 3*combos/combosTarget;
      if (combos > combosTarget) {
        musicPaused = t;
        neverUFOs = combos = 0;
        ufos.push([
          W * Math.random(),
          H * Math.random(),
          0,
          0,
          0
        ]);
        achievements[2] ++;
      }

      musicPhase += musicFreq*2*Math.PI*dt/1000;
      if ((Math.sin(musicPhase) > 0) !== musicTick) {
        musicTick = !musicTick;
        play(musicTick ? Amusic1 : Amusic2);
      }
    }

    // randomly send some asteroids
    /*
    if (Math.random() < 0.001 * dt)
      randomInGameAsteroid();
    */

    // player lifecycle

    if (lifes == 0 && playingSince > 0) {
      // player enter
      resurrectionTime = t;
      lifes = 4;
      player++;
      score = 0;
      scoreForLife = 10000;
      jumpingAmp = 0;
      jumpingFreq = 0;
      asteroids = [];
      ufos = [];
      play(Acoin);
      if (player > 1) {
        //localStorage.ba_pl = player;
        //localStorage.ba_ach = achievements;
      }
    }

    // inc lifecycle

    if (playingSince > 1000 && !dying) {
      for (i = 0; i < incomingObjects.length; i++) {
        var o = incomingObjects[i];
        if (!o[10]) {
          var p = incPosition(o);
          var matchingTap = tap && circleCollides(tap, p, (MOBILE ? 60 : 20) + 10 * o[6]);
          if (keys[o[7]] || matchingTap) {
            // send an asteroid
            neverPlayed = tap = keys[o[7]] = 0;
            if (sendAsteroid(o)) {
              achievements[0] ++;
              if (player > 3) combos ++;
              incomingObjects.splice(i--, 1);
            }
            else {
              // failed to aim (red aiming)
              score += 5000;
              combos = 0;
              lastLoseShot = o[10] = t;
            }
          }
        }
        else {
          if (t-o[10] > 1000)
            incomingObjects.splice(i--, 1);
        }
      }
      tap = 0;

      while(maybeCreateInc());
    }

    // spaceship lifecycle

    if (dying && t-dying > 2000 + (lifes>1 ? 0 : 2000)) {
      dying = 0;
      spaceship = [ W/2, H/2, 0, 0, 0 ];
      if (--lifes) {
        resurrectionTime = t;
      }
      else {
        // Player lost. game over
        playingSince = -5000;
        randomAsteroids();
        ufos = [];
        setTimeout(function(){ play(Aleave); }, 1000);
      }
    }

    // score lifecycle

    if (score >= scoreForLife) {
      lastExtraLife = t;
      lifes ++;
      scoreForLife += 10000;
      play(Alife);
      if (lifes > 5) {
        gameOver = 1;
        incomingObjects = [];
        ufos = [];
        randomAsteroids();
        //localStorage.ba_pl=0;
      }
    }

    if (!dying && playingSince>0 && t - lastScoreIncrement > 100) {
      score += 10;
      lastScoreIncrement = t;
    }
    best = Math.max(best, score);

    // collision

    bullets.forEach(function (bull, i) {
      if (!bull[5]) nbSpaceshipBullets ++;
      var j;

      if (bull[4]<900) {
        // bullet-spaceship collision
        if (!dying && circleCollides(bull, spaceship, 20)) {
          explose(bull);
          bullets.splice(i, 1);
          spaceshipDie();
          return;
        }

        // bullet-ufo collision
        for (j = 0; j < ufos.length; ++j) {
          var ufo = ufos[j];
          if (circleCollides(bull, ufo, 20)) {
            explose(bull);
            bullets.splice(i, 1);
            ufos.splice(j, 1);
            return;
          }
        }
      }

      for (j = 0; j < asteroids.length; ++j) {
        var aster = asteroids[j];
        var lvl = aster[5];
        // bullet-asteroid collision
        if (circleCollides(bull, aster, 10 * lvl)) {
          explose(bull);
          bullets.splice(i, 1);
          explodeAsteroid(j);
          score += 50 * Math.floor(0.4 * (6 - lvl) * (6 - lvl));
          return;
        }
      }
    });

    if (!dying && playingSince > 0) asteroids.forEach(function (aster, j) {
      // asteroid-spaceship collision
      if (circleCollides(aster, spaceship, 10 + 10 * aster[5])) {
        if (t - resurrectionTime < 200) {
          // if spaceship just resurect, will explode the asteroid
          explodeAsteroid(j);
        }
        else {
          // otherwise, player die
          explose(spaceship);
          spaceshipDie();
        }
      }
    });

    // run spaceship AI
    AIexcitement = 0;
    if (!dying && playingSince > 0) {
      var ax = Math.cos(spaceship[4]);
      var ay = Math.sin(spaceship[4]);

      // ai logic (determine the 3 inputs)
      aiLogic(1-Math.exp(-(player-0.8)/14));

      // apply ai inputs with game logic

      var rotSpeed = 0.004 + 0.003 * (1-Math.exp(-player/40));
      var accSpeed = 0.0003 - 0.0002 * Math.exp(-(player-1)/5) + 0.00001 * player;
      var shotRate = 100 + 1000 * Math.exp(-(player-1)/8) + 300 * Math.exp(-player/20);

      spaceship[2] += AIboost * dt * accSpeed * ax;
      spaceship[3] += AIboost * dt * accSpeed * ay;
      spaceship[4] = normAngle(spaceship[4] + AIrotate * dt * rotSpeed);
      if (nbSpaceshipBullets < 3) {
        if (AIshoot && t-lastBulletShoot > shotRate) {
          lastBulletShoot = t;
          play(Ashot);
          shoot(spaceship, 0.3, spaceship[4]);
        }
      }
    }
  }

  euclidPhysics(spaceship);
  asteroids.forEach(polarPhysics);
  ufos.forEach(euclidPhysics);
  bullets.forEach(euclidPhysics);
  particles.forEach(polarPhysics);

  ufos.forEach(applyUFOlogic);
  incomingObjects.forEach(applyIncLogic);

  particles.forEach(applyLife);
  loopOutOfBox(spaceship);
  asteroids.forEach(playingSince > 0 && !awaitingContinue && !gameOver ? destroyOutOfBox : loopOutOfBox);
  ufos.forEach(loopOutOfBox);
  bullets.forEach(applyLife);
  bullets.forEach(loopOutOfBox);

  excitementSmoothed += 0.04 * (AIexcitement - excitementSmoothed);
  AIboostSmoothed += 0.04 * (AIboost - AIboostSmoothed);

  // handling jumping / shaking
  killSmoothed -= dt * 0.0003 * killSmoothed;
  jumpingAmpSmoothed += 0.04 * (jumpingAmp - jumpingAmpSmoothed);
  jumpingFreqSmoothed += 0.04 * (jumpingFreq - jumpingFreqSmoothed);
  if (killSmoothed > 1.3) {
    if (jumpingAmp < 0.5) {
      jumpingFreq = 1 + Math.random();
      jumpingAmp ++;
    }
  }
  if (killSmoothed < 0.8) {
    jumpingAmp = 0;
  }
  var prevPhase = jumpingPhase;
  jumpingPhase += jumpingFreq *2*Math.PI*dt/1000;
  jumping = jumpingAmpSmoothed * Math.pow(Math.cos(jumpingPhase), 2.0);
  if (Math.cos(prevPhase) < 0 && 0 < Math.cos(jumpingPhase)) {
    jumpingFreq = 1 + 3 * Math.random() * Math.random();
  }
  if (jumpingAmp < 0.5) {
    jumpingAmpSmoothed += 0.04 * (jumpingAmp - jumpingAmpSmoothed);
  }

  var shake = jumpingAmp * Math.pow(smoothstep(0.2, 0.0, jumping), 0.5);
  if (shake > 0.5 && t-lastJump>100) {
    play(Ajump);
    lastJump = t;
  }
  shaking = [
    30 * shake * (Math.random()-0.5) / FW,
    30 * shake * (Math.random()-0.5) / FH
  ];
}


// Game DRAWING

function drawGame () {
  ctx.save();
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  renderCollection(asteroids, drawAsteroid);
  renderCollection(ufos, drawUFO);
  renderCollection(bullets, drawBullet);
  renderCollection(particles, drawParticle);

  if (playingSince > 0 && !awaitingContinue && !gameOver) {
    ctx.save();
    translateTo(spaceship);
    drawSpaceship(spaceship);
    ctx.restore();
  }

  drawGameUI();

  drawGlitch();
}


function translateTo (p) {
  ctx.translate(p[0], p[1]);
}

function renderCollection (coll, draw) {
  for (var i=0; i<coll.length; ++i) {
    ctx.save();
    translateTo(coll[i]);
    draw(coll[i]);
    ctx.restore();
  }
}
