/* global
ctx path font gameOver W H player playingSince:true awaitingContinue scoreTxt
lifes dying MOBILE best score t UFO neverPlayed lastExtraLife neverUFOs dt play
Amsg GAME_MARGIN FW FH combos achievements musicTick helpVisible */

// IN GAME UI

function button (t1, t2) {
  ctx.globalAlpha = 1;
  path([
    [0, 0],
    [160, 0],
    [160, 120],
    [0, 120]
  ]);
  ctx.translate(80, 30);
  ctx.stroke();
  ctx.fillStyle = "#000";
  ctx.fill();
  ctx.save();
  font(t1, 2);
  ctx.restore();
  ctx.save();
  ctx.translate(0, 40);
  font(t2, 2);
  ctx.restore();
}

function drawGameUI () {
  ctx.save();
  ctx.fillStyle = ctx.strokeStyle = "#0f0";
  ctx.globalAlpha = 0.3;

  if (gameOver) {
    ctx.save();
    ctx.strokeStyle = "#0f0";
    ctx.globalAlpha = 0.3;
    ctx.save();
    ctx.translate((W-340)/2, H/8);
    font("YOU EARNED ", 2, 1);
    ctx.globalAlpha = 0.5;
    font((player*25)+"¢", 2, 1);
    ctx.restore();
    ctx.save();
    ctx.translate(W/2, H/4);
    font("FROM "+player+" PLAYERS", 2);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.translate((W-200)/2, H/2);
    drawAchievements(2);
    ctx.restore();

    ctx.save();
    ctx.translate(W/2 - 180, H - 160);
    button("TWEET", "SCORE");
    ctx.restore();

    ctx.save();
    ctx.translate(W/2 + 20, H - 160);
    button("PLAY", "AGAIN");
    ctx.restore();

    ctx.restore();
  }
  else if (playingSince < 0 || awaitingContinue) {
    ctx.save();
    ctx.translate(W-50, 20);
    font(scoreTxt(0), 1.5, -1);
    ctx.restore();

    ctx.save();
    ctx.translate(50, 70);
    if ((!awaitingContinue || playingSince>0) && t%1000<500)
      font("PLAYER "+(awaitingContinue||player+1), 2, 1);
    ctx.restore();

    ctx.save();
    ctx.translate(W/2 - 160, 0.7*H);
    path([
      [0,2],
      [0,18]
    ]);
    ctx.stroke();
    ctx.translate(40,0);
    font("COIN", 2, 1);
    ctx.translate(40,0);
    path([
      [0,2],
      [0,18]
    ]);
    ctx.stroke();
    ctx.translate(40,0);
    font("PLAY", 2, 1);
    ctx.restore();
  }
  else {
    for (var i=1; i<lifes; i++) {
      ctx.save();
      ctx.translate(60 + i * 10, 50);
      ctx.rotate(-Math.PI/2);
      path([
        [-4, -4],
        [ 10, 0],
        [ -4, 4],
        [ -3, 0]
      ]);
      ctx.stroke();
      ctx.restore();
    }
  }
  if (!gameOver && dying && lifes==1) {
    ctx.save();
    ctx.lineWidth = 2;
    ctx.translate(W/2, 140);
    font("GAME OVER", 2);
    ctx.restore();
  }
  if (!gameOver && awaitingContinue && playingSince > 0) {
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.translate(W/2, 140);
    font("CONTINUE ?", 3);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.translate(W/4, 210);
    font("YES", MOBILE ? 4 : 6);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.translate(3*W/4, 210);
    font("NO", MOBILE ? 4 : 6);
    ctx.restore();
  }
  ctx.save();
  ctx.translate(W/2, H-14);
  font("2015 GREWEB INC", .6);
  ctx.restore();

  if (!gameOver) {
    ctx.save();
    ctx.translate(W/2, 20);
    font(scoreTxt(best), .6);
    ctx.restore();

    ctx.save();
    ctx.translate(50, 20);
    font(scoreTxt(score), 1.5, 1);
    ctx.restore();
  }

  if (gameOver || playingSince<0 && t%1000<800) {
    ctx.save();
    ctx.translate(W-20, H-24);
    font(MOBILE ? "MOBILE" : "DESKTOP", .6, -1);
    ctx.restore();
    ctx.save();
    ctx.translate(W-20, H-14);
    font("VERSION", .6, -1);
    ctx.restore();
  }

  ctx.restore();
}

function drawGlitch () {
  ctx.save();
  ctx.fillStyle =
  ctx.strokeStyle = "#f00";
  ctx.globalAlpha = 0.03;
  ctx.translate(W/2, H/2);
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, 2*Math.PI);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, 2*Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 12, 4, 6);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 12, 1, 2);
  ctx.stroke();
  ctx.restore();
}


// EXTERNAL UI

var badgesIcons = [
  [
    [-11, -11],
    [4, -13],
    [6, -6],
    [14, 0],
    [14, 8],
    [6, 8],
    [-6, 14],
    [-14, 0]
  ],
  [
    [-8, 13],
    [0, -13],
    [8, 13],
    [0, 11],
    [-8, 13],
    ,
    [-10, -2],
    [10, 2],
    ,
    [10, -2],
    [-10, 2],
    ,
  ],
  UFO.map(function (p) {
    return p ? [p[0]-11,p[1]-7] : p;
  })
];

var lastStatement, lastStatementTime = 0;

var lastMessage2;

function drawUI () {
  var currentMessage = "",
    currentMessage2 = "",
    currentMessageClr = "#f7c",
    currentMessageClr2 = "#7fc";

  function announcePlayer (player) {
    currentMessage = "PLAYER "+player;
    currentMessage2 = [
      "GENIOUS PLAYER!!",
      "EXPERIENCED PLAYER!!",
      "GOOD PLAYER. GET READY",
      "NICE PLAYER.",
      "BEGINNER.",
      "VERY BEGINNER. EASY KILL"
    ][Math.floor(Math.exp((-player)/8)*6)];
  }

  if (gameOver) {
    currentMessage = "PLAYER MASTERED THE GAME";
    currentMessage2 = "REACHED ᐃᐃᐃᐃᐃ";
  }
  else if (!player) {
    if (playingSince<-7000) {
      currentMessage = "BEHIND ASTEROIDS";
      currentMessage2 = "THE DARK SIDE";
    }
    else if (playingSince<-3500) {
      currentMessageClr = currentMessageClr2 = "#7cf";
      currentMessage = "SEND ASTEROIDS TO MAKE";
      currentMessage2 = "PLAYERS WASTE THEIR MONEY";
    }
    else if (!awaitingContinue) {
      var nb = Math.min(25, Math.floor((playingSince+3500)/80));
      for (var i=0; i<nb; i++)
        currentMessage += ".";
      if (playingSince>-2000)
        currentMessage2 = "A NEW PLAYER!";
    }
    else {
      if (playingSince<0) playingSince = 0; // jump to skip the "player coming"
      announcePlayer(awaitingContinue);
    }
  }
  else if (dying) {
    if (lifes==1) {
      currentMessageClr2 = "#f66";
      currentMessage = "GOOD JOB !!!";
      currentMessage2 = "THE DUDE IS BROKE";
    }
    else if (lifes==2) {
      currentMessageClr2 = "#f66";
      currentMessage = "OK...";
      currentMessage2 = "ONE MORE TIME !";
    }
    else {
      if (lastStatement && t - lastStatementTime > 3000) { // lastStatementTime is not used here
        currentMessage = lastStatement;
      }
      else {
        currentMessage = ["!!!", "GREAT!", "COOL!", "OMG!", "AHAH!", "RUDE!", "EPIC!", "WICKED!", "SHAME!", "HEHEHE!", "BWAHAHA!"];
        lastStatement = currentMessage = currentMessage[Math.floor(Math.random() * currentMessage.length)];
        lastStatementTime = 0;
      }
    }
  }
  else {
    if (playingSince<0) {
      currentMessage = "INCOMING NEW PLAYER...";
      currentMessage2 = "25¢ 25¢ 25¢ 25¢ 25¢";
    }
    else if (playingSince<6000 && lifes==4) {
      announcePlayer(player);
    }
    else {
      currentMessageClr2 = "#f66";
      if (lastStatement && t - lastStatementTime < 3000) {
        currentMessage2 = lastStatement;
      }
      else {
        if (neverPlayed) {
          if (helpVisible()) {
            currentMessageClr = currentMessageClr2 = "#f7c";
            currentMessage = MOBILE ? "TAP ON ASTEROIDS" : "PRESS ASTEROIDS LETTER";
            currentMessage2 = "TO SEND THEM TO THE GAME";
          }
        }
        else if (lifes > 4 && t - lastExtraLife > 5000) {
          currentMessageClr = currentMessageClr2 = "#f66";
          currentMessage = "DON'T LET PLAYER";
          currentMessage2 = "REACH ᐃᐃᐃᐃᐃ !!!";
        }
        else if (score > 10000 && t - lastExtraLife < 4500) {
          currentMessageClr = currentMessageClr2 = "#f66";
          currentMessage = "OH NO! PLAYER JUST";
          currentMessage2 = "WON AN EXTRA LIFE!";
        }
        else if (player==2 && 5000<playingSince) {
          currentMessageClr2 = currentMessageClr = "#7cf";
          currentMessage = "LETS TRAIN WITH...";
          currentMessage2 = "AIMING";
        }
        else if (player==3 && 5000<playingSince) {
          currentMessageClr = "#7cf";
          currentMessageClr2 = "#f66";
          currentMessage = "CAREFUL ABOUT THE";
          currentMessage2 = "RED AIMING";
        }
        else if (player==4 && 5000<playingSince && neverUFOs) {
          currentMessageClr = currentMessageClr2 = "#f7c";
          currentMessage = "MAKE COMBOS TO SEND";
          currentMessage2 = "AN UFO !!!";
        }
        else if (player > 5) {
          lastStatement = 0;
          if (Math.random() < 0.0001 * dt && t - lastStatementTime > 8000) {
            currentMessage2 = [
              "COME ON! KILL IT!",
              "JUST DO IT!",
              "I WANT ¢¢¢",
              "GIVE ME SOME ¢¢¢",
              "DO IT!",
              "DESTROY IT!"
            ];
            lastStatement = currentMessage2 = currentMessage2[Math.floor(Math.random() * currentMessage2.length)];
            lastStatementTime = t;
          }
        }
      }
    }
  }

  if (currentMessage2 && lastMessage2 !== currentMessage2 &&
    (currentMessageClr2 == "#f66" || currentMessageClr2 == "#f7c")) {
    play(Amsg);
  }

  ctx.save();
  ctx.translate(GAME_MARGIN, MOBILE ? 40 : 2);
  ctx.lineWidth = (t%600>300) ? 2 : 1;
  ctx.save();
  ctx.strokeStyle = currentMessageClr;
  font(currentMessage, MOBILE ? 1.5 : 2, 1);
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = currentMessageClr2;
  ctx.translate(0, MOBILE ? 30 : 40);
  font(lastMessage2 = currentMessage2, MOBILE ? 1.5 : 2, 1);
  ctx.restore();
  ctx.restore();

  if (gameOver) return;

  ctx.save();
  ctx.translate(FW - GAME_MARGIN, 2);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#7cf";
  font(((playingSince>0&&awaitingContinue||player)*25)+"¢", 2, -1);
  ctx.restore();


  ctx.save();
  ctx.globalAlpha = musicTick ? 1 : 0.6;
  ctx.strokeStyle = "#7cf";
  ctx.translate(FW - GAME_MARGIN, FH - 30);
  if (combos) font(combos+"x", 1.5, -1);
  ctx.restore();

  /*
  if (combos && combosTarget-combos < 9) {
    ctx.save();
    ctx.strokeStyle = "#7cf";
    ctx.globalAlpha = musicTick ? 1 : 0.5;
    ctx.translate(FW - GAME_MARGIN, FH - 50);
    font((1+combosTarget-combos)+" ", 1, -1);
    ctx.translate(0, 0);
    path(UFO);
    ctx.stroke();
    ctx.restore();
  }
  */

  if (achievements) {
    ctx.save();
    ctx.translate(GAME_MARGIN + 50, FH - 20);
    ctx.strokeStyle = "#fc7";
    drawAchievements(1);
    ctx.restore();
  }
}

function drawAchievements (fontSize) {
  for (var j = 0; j < 3; j++) {
    var badge = achievements[j];
    if (badge) {
      ctx.save();
      ctx.translate(100 * j, 0);
      path(badgesIcons[j]);
      ctx.stroke();
      ctx.translate(0, -20 - 10 * fontSize);
      font(""+badge, fontSize);
      ctx.restore();
    }
  }
}
