/* global
particles play Aexplosion1 Aexplosion2 ctx
*/
function explose (o) {
  play(Math.random()<0.5 ? Aexplosion1 : Aexplosion2);
  var n = Math.floor(19 + 9 * Math.random());
  for (var i = 0; i < n; ++i) {
    var l = 30 * Math.random() - 10;
    var a = (Math.random() + 2 * Math.PI * i) / n;
    particles.push([
      o[0] + l * Math.cos(a),
      o[1] + l * Math.sin(a),
      a,
      0.06,
      Math.random()<0.3 ? 0 : 1000
    ]);
  }
}

// RENDERING


function drawParticle () {
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = "#f00";
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, 2*Math.PI);
  ctx.fill();
}
