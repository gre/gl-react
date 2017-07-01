/* global
g
gl
textureGame
smoothstep
glSetTexture
glBindFBO
glGetFBOTexture
glUniformLocation
glBindTexture
laserFbo
playerFbo
glareFbo
fbo1 fbo2
persistenceFbo
copyShader
glBindShader
laserShader
playerShader
blur1dShader
gameShader
glareShader
persistenceShader
t
excitementSmoothed
gameOver
player
playingSince
lifes
lastLoseShot
shaking
jumping
dying
*/

function drawPostProcessing () {
  glSetTexture(textureGame, g);

  // Laser
  glBindFBO(laserFbo);
  glBindShader(laserShader);
  gl.uniform1i(glUniformLocation(laserShader, "t"), glBindTexture(textureGame, 0));
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  // Player / env
  glBindFBO(playerFbo);
  glBindShader(playerShader);
  gl.uniform1f(glUniformLocation(playerShader, "pt"), playingSince / 1000);
  gl.uniform1f(glUniformLocation(playerShader, "pl"), player);
  gl.uniform1f(glUniformLocation(playerShader, "ex"), gameOver || excitementSmoothed);
  gl.uniform1f(glUniformLocation(playerShader, "J"), jumping);
  gl.uniform1f(glUniformLocation(playerShader, "P"), playingSince<0 || gameOver || dying ? 0 : 1);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  glBindFBO(fbo1);
  glBindShader(blur1dShader);
  gl.uniform1i(glUniformLocation(blur1dShader, "t"), glBindTexture(glGetFBOTexture(playerFbo), 0));
  gl.uniform2f(glUniformLocation(blur1dShader, "dir"),  2, 2 );
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  glBindFBO(fbo2);
  glBindShader(blur1dShader);
  gl.uniform1i(glUniformLocation(blur1dShader, "t"), glBindTexture(glGetFBOTexture(fbo1), 0));
  gl.uniform2f(glUniformLocation(blur1dShader, "dir"),  -2, 2 );
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  glBindFBO(fbo1);
  glBindShader(blur1dShader);
  gl.uniform1i(glUniformLocation(blur1dShader, "t"), glBindTexture(glGetFBOTexture(fbo2), 0));
  gl.uniform2f(glUniformLocation(blur1dShader, "dir"),  6, 0 );
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  glBindFBO(playerFbo);
  glBindShader(blur1dShader);
  gl.uniform1i(glUniformLocation(blur1dShader, "t"), glBindTexture(glGetFBOTexture(fbo1), 0));
  gl.uniform2f(glUniformLocation(blur1dShader, "dir"),  0, 2 );
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  // Glare
  glBindFBO(glareFbo);
  glBindShader(glareShader);
  gl.uniform1i(glUniformLocation(glareShader, "t"), glBindTexture(glGetFBOTexture(laserFbo), 0));
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  glBindFBO(fbo1);
  glBindShader(blur1dShader);
  gl.uniform1i(glUniformLocation(blur1dShader, "t"), glBindTexture(glGetFBOTexture(glareFbo), 0));
  gl.uniform2f(glUniformLocation(blur1dShader, "dir"),  2, -4 );
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  glBindFBO(glareFbo);
  glBindShader(blur1dShader);
  gl.uniform1i(glUniformLocation(blur1dShader, "t"), glBindTexture(glGetFBOTexture(fbo1), 0));
  gl.uniform2f(glUniformLocation(blur1dShader, "dir"),  4, -8 );
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  // Blur
  glBindFBO(fbo1);
  glBindShader(blur1dShader);
  gl.uniform1i(glUniformLocation(blur1dShader, "t"), glBindTexture(glGetFBOTexture(laserFbo), 0));
  gl.uniform2f(glUniformLocation(blur1dShader, "dir"),  0.5, 0.5 );
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  glBindFBO(fbo2);
  glBindShader(blur1dShader);
  gl.uniform1i(glUniformLocation(blur1dShader, "t"), glBindTexture(glGetFBOTexture(fbo1), 0));
  gl.uniform2f(glUniformLocation(blur1dShader, "dir"),  -0.5, 0.5 );
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  glBindFBO(fbo1);
  glBindShader(blur1dShader);
  gl.uniform1i(glUniformLocation(blur1dShader, "t"), glBindTexture(glGetFBOTexture(fbo2), 0));
  gl.uniform2f(glUniformLocation(blur1dShader, "dir"),  1, 0 );
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  glBindFBO(fbo2);
  glBindShader(blur1dShader);
  gl.uniform1i(glUniformLocation(blur1dShader, "t"), glBindTexture(glGetFBOTexture(fbo1), 0));
  gl.uniform2f(glUniformLocation(blur1dShader, "dir"),  0, 1 );
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  // Persistence
  glBindFBO(fbo1);
  glBindShader(persistenceShader);
  gl.uniform1i(glUniformLocation(persistenceShader, "t"), glBindTexture(glGetFBOTexture(fbo2), 0));
  gl.uniform1i(glUniformLocation(persistenceShader, "r"), glBindTexture(glGetFBOTexture(persistenceFbo), 1));
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  glBindFBO(persistenceFbo);
  glBindShader(copyShader);
  gl.uniform1i(glUniformLocation(copyShader, "t"), glBindTexture(glGetFBOTexture(fbo1), 0));
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  // Final draw
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  glBindShader(gameShader);
  gl.uniform1i(glUniformLocation(gameShader, "G"), glBindTexture(glGetFBOTexture(laserFbo), 0));
  gl.uniform1i(glUniformLocation(gameShader, "R"), glBindTexture(glGetFBOTexture(persistenceFbo), 1));
  gl.uniform1i(glUniformLocation(gameShader, "B"), glBindTexture(glGetFBOTexture(fbo2), 2));
  gl.uniform1i(glUniformLocation(gameShader, "L"), glBindTexture(glGetFBOTexture(glareFbo), 3));
  gl.uniform1i(glUniformLocation(gameShader, "E"), glBindTexture(glGetFBOTexture(playerFbo), 4));
  gl.uniform1f(glUniformLocation(gameShader, "s"),
    !player ? smoothstep(-4000, -3000, playingSince) : 1);
  gl.uniform1f(glUniformLocation(gameShader, "F"),
    smoothstep(300, 0, t-lastLoseShot) +
    !gameOver && lifes>4 ? 0.5 * smoothstep(-1, 1, Math.cos(0.01*t)) : 0);
  gl.uniform2f(glUniformLocation(gameShader, "k"), shaking[0], shaking[1]);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}
