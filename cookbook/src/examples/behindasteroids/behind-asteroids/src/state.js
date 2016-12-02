/* global W H */

// N.B: constants don't live here

var t = 0, dt,

  spaceship = [ W/2, H/2, 0, 0, 0 ], // [x, y, velx, vely, rot]
  asteroids = [], // array of [x, y, rot, vel, shape, lvl]
  ufos = [], // array of [x, y, vx, vy, timeBeforeShot]
  bullets = [], // array of [x, y, velx, vely, life, isAlien]
  incomingObjects = [], // array of: [pos, vel, ang, force, rotVel, shape, lvl, key, rotAmp, rotAmpValid, explodeTime]
  particles = [], // array of [x, y, rot, vel, life]

  dying = 0,
  resurrectionTime = 0,
  best = 0,
  score = 0, // current asteroids player score
  scoreForLife, // will track the next score to win a life (10000, 20000, ...)
  playingSince = -10000,
  deads = 0,
  player = 0,
  lifes = 0,

  AIshoot = 0, AIboost = 0, AIrotate = 0, AIexcitement = 0,
  AIboostSmoothed = 0,

  shaking = [0,0],
  jumping = 0,
  jumpingFreq = 0,
  jumpingPhase = 0,
  jumpingFreqSmoothed = 0,
  jumpingAmp = 0,
  jumpingAmpSmoothed = 0,
  killSmoothed = 0,

  musicPhase = 0,
  musicTick = 0,
  musicPaused = 0,
  ufoMusicTime = 0,

  excitementSmoothed = 0,
  neverPlayed = 1,
  neverUFOs = 1,
  combos = 0,
  combosTarget,
  gameOver,
  awaitingContinue = 0,//localStorage.ba_pl && parseInt(localStorage.ba_pl),
  // achievements: [nbAsteroids, nbKills, nbUfos]
  achievements,

  lastScoreIncrement = 0,
  lastJump = 0,
  lastBulletShoot = 0,
  lastExtraLife = 0,
  lastLoseShot = 0,

  // Input state : updated by user events, handled & emptied by the update loop
  keys = {},
  tap,

  // variables related to setup
  gameScale;


function helpVisible () {
  return neverPlayed &&
    incomingObjects[0] &&
    playingSince>8000;
}
