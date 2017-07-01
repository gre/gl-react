const names = `\
hellogl
helloblue
helloblueanim
colordisc
gradients
diamondcrop
diamondhello
diamondanim
heart
animated
saturation
colorscale
distortion
transitions
textfunky
textanimated
glsledit
paint
pixeleditor
blurxy
blurxydownscale
blurmulti
blurmap
blurmapmouse
blurmapdyn
blurimgtitle
gol
golglider
golrot
golrotscu
video
blurvideo
webcam
webcampersistence
golwebcam
mergechannels
mergechannelsfun
demotunnel
demodesert
demodesertcrt
behindasteroids
ibex`.split("\n");

const examples = {};

names.forEach(name => {
  const { default: Example, ...rest } = require("./" + name + "/index.js");
  console.log(name);
  const source = require("./" + name + "/index.source.js");
  examples[name] = { ...rest, Example, source };
});

export default examples;
