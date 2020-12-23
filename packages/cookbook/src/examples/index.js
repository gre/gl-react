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
blurfeedback
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
sdf1
demotunnel
demodesert
demodesertcrt
behindasteroids
ibex`.split("\n");

const examples = {};

names.forEach((name) => {
  const { default: Example } = require("./" + name + "/index.js");
  const {
    default: _, // eslint-disable-line
    ...rest
  } = require("./" + name + "/meta.js");
  const source = require("./" + name + "/index.source.js");
  examples[name] = { ...rest, Example, source, path: name };
});

export default examples;
