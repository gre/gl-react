/* global
keys
tap:true
MOBILE
c
d
gameOver
W
gameScale
achievements:true
player:true
playingSince:true
awaitingContinue:true
*/

/*
for (var i=0; i<99; ++i) keys[i] = 0;

var fullScreenRequested = 0;
function onTap (e) {
  if (MOBILE && !fullScreenRequested && d.webkitRequestFullScreen){
    d.webkitRequestFullScreen();
    fullScreenRequested = 1;
  }

  var r = c.getBoundingClientRect(),
    x = (e.clientX - r.left) / gameScale,
    y = (e.clientY - r.top) / gameScale;
  if (gameOver) {
    if(280 < y && y < 400) {
      if (W/2 - 180 < x && x < W/2 - 20) {
        open("https://twitter.com/intent/tweet?via=greweb&url="+
        encodeURIComponent(location.href)+
        "&text="+
        encodeURIComponent(
          "Reached Level "+player+
          " ("+(player*25)+"¢) with "+
          achievements[0]+"⬠ "+
          achievements[1]+"ᐃ "+
          achievements[2]+"🝞"
        ));
      }
      else if (W/2 + 20 < x && x < W/2 + 180) {
        location.reload();
      }
    }
  }
  else if (awaitingContinue) {
    if (playingSince>0 && 170<y && y<310) {
      // continue game action
      if (x<W/2) { // YES
        player = awaitingContinue-1;
        playingSince = awaitingContinue = 0;
        achievements = localStorage.ba_ach.split(",").map(function (v) {
          return parseInt(v, 10);
        });
      }
      else { // NO
        playingSince = awaitingContinue = 0;
      }
    }
  }
  else {
    tap = [x, y];
  }
}

if (MOBILE) {
  addEventListener("touchstart", function (e) {
    e.preventDefault();
    onTap(e.changedTouches[0]);
  });
}
else {
  addEventListener("click", function (e) {
    e.preventDefault();
    onTap(e);
  });
  addEventListener("keydown", function (e) {
    keys[e.which] = 1;
  });
  addEventListener("keyup", function (e) {
    keys[e.which] = 0;
  });
}
*/
