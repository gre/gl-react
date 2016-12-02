/* global g d MOBILE
gameScale: true
glCreateFBO glCreateShader glCreateTexture glUniformLocation
STATIC_VERT
BLUR1D_FRAG
COPY_FRAG
GAME_FRAG
GLARE_FRAG
LASER_FRAG
PERSISTENCE_FRAG
PLAYER_FRAG
*/

var ctx,
  gameCtx = g.getContext("2d"),
  FW = MOBILE ? 480 : 800,
  FH = MOBILE ? 660 : 680,
  GAME_MARGIN = MOBILE ? 50 : 120,
  GAME_Y_MARGIN = MOBILE ? 140 : GAME_MARGIN,
  GAME_INC_PADDING = MOBILE ? 40 : 80,
  W = FW - 2 * GAME_MARGIN,
  H = FH - 2 * GAME_Y_MARGIN,
  borderLength = 2*(W+H+2*GAME_INC_PADDING),
  SEED = Math.random();

// DOM setup

d.style.webkitTransformOrigin = d.style.transformOrigin = "0 0";

g.width = W;
g.height = H;

var uiScale = 1;

function checkSize () {

}
