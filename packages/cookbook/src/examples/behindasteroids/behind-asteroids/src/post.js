
return {
  dispose: function(){
    cancelAnimationFrame(raf);
  },
  getWebGLParams: function () {
    var pt = playingSince / 1000;
    var pl = player;
    var ex = gameOver || excitementSmoothed;
    var J = jumping;
    var P = playingSince<0 || gameOver || dying ? 0 : 1;
    var s = !player ? smoothstep(-4000, -3000, playingSince) : 1;
    var F = smoothstep(300, 0, t-lastLoseShot) +
      !gameOver && lifes>4 ? 0.5 * smoothstep(-1, 1, Math.cos(0.01*t)) : 0;
    var k = [ shaking[0], shaking[1] ];
    return {
      pt: pt,
      pl: pl,
      ex: ex,
      J: J,
      P: P,
      s: s,
      F: F,
      k: k,
      W: W,
      H: H,
      S: SEED
    };
  }
};

});
