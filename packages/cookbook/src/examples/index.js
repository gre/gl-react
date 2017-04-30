import hellogl_E from "./hellogl";
import * as hellogl_m from "./hellogl/meta";
const hellogl_s = `
//@flow
import React, { Component } from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";

// in gl-react you need to statically define "shaders":
const shaders = Shaders.create({
  helloGL: {
// This is our first fragment shader in GLSL language (OpenGL Shading Language)
// (GLSL code gets compiled and run on the GPU)
    frag: GLSL\`
precision highp float;
varying vec2 uv;
void main() {
  gl_FragColor = vec4(uv.x, uv.y, 0.5, 1.0);
}\`
// the main() function is called FOR EACH PIXELS
// the varying uv is a vec2 where x and y respectively varying from 0.0 to 1.0.
// we set in output the pixel color using the vec4(r,g,b,a) format.
// see [GLSL_ES_Specification_1.0.17](http://www.khronos.org/registry/gles/specs/2.0/GLSL_ES_Specification_1.0.17.pdf)
  }
});

export default class Example extends Component {
  render() {
    return (
      <Surface width={300} height={300}>
        <Node shader={shaders.helloGL} />
      </Surface>
    );
// Surface creates the canvas, an area of pixels where you can draw.
// Node instanciates a "shader program" with the fragment shader defined above.
  }
}
`;
export const hellogl={ Example: hellogl_E, source: hellogl_s, ...hellogl_m };
import helloblue_E from "./helloblue";
import * as helloblue_m from "./helloblue/meta";
const helloblue_s = `
//@flow
import React, { Component } from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";

const shaders = Shaders.create({
  helloBlue: {
 // uniforms are variables from JS. We pipe blue uniform into blue output color
    frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform float blue;
void main() {
  gl_FragColor = vec4(uv.x, uv.y, blue, 1.0);
}\` }
});

// We can make a <HelloBlue blue={0.5} /> that will render the concrete <Node/>
export class HelloBlue extends Component {
  render() {
    const { blue } = this.props;
    return <Node shader={shaders.helloBlue} uniforms={{ blue }} />;
  }
}

// Our example will pass the slider value to HelloBlue
export default class Example extends Component {
  render() {
    return (
      <Surface width={300} height={300}>
        <HelloBlue blue={this.props.blue} />
      </Surface>
    );
  }
  static defaultProps = { blue: 0.5 };
}
`;
export const helloblue={ Example: helloblue_E, source: helloblue_s, ...helloblue_m };
import helloblueanim_E from "./helloblueanim";
import * as helloblueanim_m from "./helloblueanim/meta";
const helloblueanim_s = `
//@flow
import React, { Component } from "react";
import { Surface } from "gl-react-dom";

// Reuse that previous HelloBlue component to animate it...
import { HelloBlue } from "../helloblue";

// timeLoop is an utility that animates a component.
// in a requestAnimationFrame loop and provide a time and tick prop
import timeLoop from "../../HOC/timeLoop";

export default timeLoop(class Example extends Component {
  render() {
    const { time } = this.props;
    return (
      <Surface width={300} height={300}>
        <HelloBlue blue={0.5 + 0.5 * Math.cos(time / 500)} />
      </Surface>
    );
  }
});
`;
export const helloblueanim={ Example: helloblueanim_E, source: helloblueanim_s, ...helloblueanim_m };
import colordisc_E from "./colordisc";
import * as colordisc_m from "./colordisc/meta";
const colordisc_s = `
//@flow
import React, { Component } from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
const shaders = Shaders.create({
  ColoredDisc: {
    frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform vec3 fromColor, toColor;
void main() {
  float d = 2.0 * distance(uv, vec2(0.5));
  gl_FragColor = mix(
    vec4(mix(fromColor, toColor, d), 1.0),
    vec4(0.0),
    step(1.0, d)
  );
}\` }
});

class ColoredDisc extends Component {
  render() {
    // fromColor/toColor must be array of 3 numbers because defined as vec3 type.
    const { fromColor, toColor } = this.props;
    return (
      <Node
        shader={shaders.ColoredDisc}
        uniforms={{ fromColor, toColor }}
      />
    );
  }
}

export default class Example extends Component {
  render() {
    const { fromColor, toColor } = this.props;
    return (
      <Surface width={300} height={300}>
        <ColoredDisc fromColor={fromColor} toColor={toColor} />
      </Surface>
    );
  }
  static defaultProps = {
    fromColor: [ 1, 0, 1 ],
    toColor: [ 1, 1, 0 ],
  };
}
`;
export const colordisc={ Example: colordisc_E, source: colordisc_s, ...colordisc_m };
import gradients_E from "./gradients";
import * as gradients_m from "./gradients/meta";
const gradients_s = `
//@flow
import React from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import timeLoop from "../../HOC/timeLoop";

const shaders = Shaders.create({
  gradients: { frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform vec4 colors[3];
uniform vec2 particles[3];
void main () {
  vec4 sum = vec4(0.0);
  for (int i=0; i<3; i++) {
    vec4 c = colors[i];
    vec2 p = particles[i];
    float d = c.a * smoothstep(0.6, 0.2, distance(p, uv));
    sum += d * vec4(c.a * c.rgb, c.a);
  }
  if (sum.a > 1.0) {
    sum.rgb /= sum.a;
    sum.a = 1.0;
  }
  gl_FragColor = vec4(sum.a * sum.rgb, 1.0);
}\`}
});

// Alternative syntax using React stateless function component
const Gradients = ({ time }) =>
  <Node
    shader={shaders.gradients}
    uniforms={{
      colors: [
        [ Math.cos(0.002*time), Math.sin(0.002*time), 0.2, 1 ],
        [ Math.sin(0.002*time), -Math.cos(0.002*time), 0.1, 1 ],
        [ 0.3, Math.sin(3+0.002*time), Math.cos(1+0.003*time), 1 ]
      ],
      particles: [
        [ 0.3, 0.3 ],
        [ 0.7, 0.5 ],
        [ 0.4, 0.9 ]
      ]
    }}
  />;

const GradientsLoop = timeLoop(Gradients);

export default () =>
  <Surface width={300} height={300}>
    <GradientsLoop />
  </Surface>;

// NB: don't abuse the uniforms array:
// it's not meant to be used with lot of objects.
// GLSL 1 also don't support variable length in loops.
`;
export const gradients={ Example: gradients_E, source: gradients_s, ...gradients_m };
import diamondcrop_E from "./diamondcrop";
import * as diamondcrop_m from "./diamondcrop/meta";
const diamondcrop_s = `
//@flow
import React, { Component } from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
const shaders = Shaders.create({
  DiamondCrop: {
  frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
void main() {
gl_FragColor = mix(
  texture2D(t, uv),
  vec4(0.0),
  step(0.5, abs(uv.x - 0.5) + abs(uv.y - 0.5))
);
}\` },
});

export const DiamondCrop = ({ children: t }) =>
  <Node shader={shaders.DiamondCrop} uniforms={{ t }} />;

export default class Example extends Component {
  render() {
    return (
      <Surface width={300} height={300}>
        <DiamondCrop>
          https://i.imgur.com/5EOyTDQ.jpg
        </DiamondCrop>
      </Surface>
    );
  }
};
`;
export const diamondcrop={ Example: diamondcrop_E, source: diamondcrop_s, ...diamondcrop_m };
import diamondhello_E from "./diamondhello";
import * as diamondhello_m from "./diamondhello/meta";
const diamondhello_s = `
//@flow
import React, { Component } from "react";
import { Surface } from "gl-react-dom";
import { DiamondCrop } from "../diamondcrop";
import { HelloBlue } from "../helloblue";

export default class Example extends Component {
  render() {
    return (
      <Surface width={300} height={300}>
        <DiamondCrop>
          <HelloBlue blue={0.8} />
        </DiamondCrop>
      </Surface>
    );
  }
}
`;
export const diamondhello={ Example: diamondhello_E, source: diamondhello_s, ...diamondhello_m };
import diamondanim_E from "./diamondanim";
import * as diamondanim_m from "./diamondanim/meta";
const diamondanim_s = `
//@flow
import React from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import { DiamondCrop } from "../diamondcrop";
import timeLoop from "../../HOC/timeLoop";

const shaders = Shaders.create({
  helloRed: {
    frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform float red;
void main() {
  gl_FragColor = vec4(red, uv.x, uv.y, 1.0);
}\` }
});

const HelloGLAnimated = timeLoop( ({ time }) =>
  <Node
    shader={shaders.helloRed}
    uniforms={{ red: Math.cos(time / 100) }}
  />
);

export default () =>
  <Surface width={300} height={300}>
    <DiamondCrop>
      <HelloGLAnimated blue={0.8} />
    </DiamondCrop>
  </Surface>;
`;
export const diamondanim={ Example: diamondanim_E, source: diamondanim_s, ...diamondanim_m };
import heart_E from "./heart";
import * as heart_m from "./heart/meta";
const heart_s = `
//@flow
import React, { Component } from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import {Motion, spring} from "react-motion";

const shaders = Shaders.create({
  Heart: { // inspired from http://glslsandbox.com/e#29521.0
    frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform sampler2D image;
uniform vec3 color;
uniform float over, toggle;
void main() {
  float scale = 1.0 - 0.1 * over - 0.8 * toggle;
  vec2 offset = vec2(0.0, -0.3 - 0.1 * over - 0.7 * toggle);
  vec2 p = scale * (2.0 * uv - 1.0 + offset);
  float a = atan(p.x, p.y) / ${Math.PI/* \\o/ */};
  float r = length(p);
  float h = abs(a);
  float d = (13.0*h - 22.0*h*h + 10.0*h*h*h - 0.3 * (1.0-over))/(6.0-5.0*h);
  float f = step(r,d) * pow(max(1.0-r/d, 0.0),0.25);
  vec3 t = texture2D(image, uv).rgb;
  vec3 c = mix(color * (1.0 + 0.6 * t), t, min(0.8 * over + toggle, 1.0));
  gl_FragColor = vec4(mix(vec3(1.0), c, f), 1.0);
}\`
  }
});

class InteractiveHeart extends Component {
  state = { over: 0, toggle: 0 };
  onMouseEnter = () => this.setState({ over: 1 });
  onMouseLeave = () => this.setState({ over: 0 });
  onClick = () => this.setState({ toggle: this.state.toggle ? 0 : 1 });
  render() {
    const { color, image } = this.props;
    const { over, toggle } = this.state;
    return (
      <Surface width={300} height={300}
        onClick={this.onClick}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}>
        <Motion
          defaultStyle={{ over, toggle }}
          style={{
            over: spring(over, [150, 15]),
            toggle: spring(toggle, [150, 15])
          }}>{ ({ over, toggle }) =>
          <Node
            shader={shaders.Heart}
            uniforms={{ color, image, over, toggle }}
          />
        }</Motion>
      </Surface>
    );
  }
}

export default () =>
  <InteractiveHeart
    color={[ 1, 0, 0 ]}
    image="https://i.imgur.com/GQo1KWq.jpg"
  />;
`;
export const heart={ Example: heart_E, source: heart_s, ...heart_m };
import animated_E from "./animated";
import * as animated_m from "./animated/meta";
const animated_s = `
//@flow
import React, { Component } from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import Animated from "animated";
const shaders = Shaders.create({
  cursor: { frag: GLSL\`
precision lowp float; varying vec2 uv; uniform vec2 style;
void main() {
  float dist = pow(1.0 - distance(style, uv), 8.0);
  gl_FragColor = vec4(smoothstep(2.0, 0.2, distance(style, uv)) * vec3(
    1.0 * dist + pow(1.0 - distance(style.y, uv.y), 16.0),
    0.5 * dist + pow(1.0 - distance(style.y, uv.y), 32.0),
    0.2 * dist + pow(1.0 - distance(style.x, uv.x), 32.0)), 1.0);
}\` }
});
class Cursor extends Component {
  render() {
    const { style: { x, y } } = this.props;
    return <Node shader={shaders.cursor} uniforms={{ style: [ x, y ] }} />;
  }
}
// using "style" is a hack. see https://github.com/animatedjs/animated/issues/45
const AnimatedCursor = Animated.createAnimatedComponent(Cursor);

export default class Example extends Component {
  state = {
    style: new Animated.ValueXY({ x: 0.5, y: 0.5 })
  };
  onMouseMove = (e: any) => {
    const rect = e.target.getBoundingClientRect();
    Animated.spring(this.state.style, {
      toValue: {
        x: (e.clientX - rect.left) / rect.width,
        y: (rect.bottom - e.clientY) / rect.height,
      }
    }).start();
  };
  render() {
    return (
      <Surface width={500} height={500} onMouseMove={this.onMouseMove}>
        <AnimatedCursor {...this.state} />
      </Surface>
    );
  }
};
`;
export const animated={ Example: animated_E, source: animated_s, ...animated_m };
import saturation_E from "./saturation";
import * as saturation_m from "./saturation/meta";
const saturation_s = `
//@flow
import React, { Component } from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";

const shaders = Shaders.create({
  Saturate: {
    frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
uniform float contrast, saturation, brightness;
const vec3 L = vec3(0.2125, 0.7154, 0.0721);
void main() {
  vec4 c = texture2D(t, uv);
	vec3 brt = c.rgb * brightness;
	gl_FragColor = vec4(mix(
    vec3(0.5),
    mix(vec3(dot(brt, L)), brt, saturation),
    contrast), c.a);
}\`
  }
});

export const Saturate = ({ contrast, saturation, brightness, children }) =>
  <Node
    shader={shaders.Saturate}
    uniforms={{ contrast, saturation, brightness, t: children }}
  />;

export default class Example extends Component {
  render() {
    return (
    <Surface width={480} height={300}>
      <Saturate {...this.props}>
        https://i.imgur.com/uTP9Xfr.jpg
      </Saturate>
    </Surface>
    );
  }
  static defaultProps = {
    contrast: 1,
    saturation: 1,
    brightness: 1,
  };
}
`;
export const saturation={ Example: saturation_E, source: saturation_s, ...saturation_m };
import colorscale_E from "./colorscale";
import * as colorscale_m from "./colorscale/meta";
const colorscale_s = `
//@flow
import React, { Component } from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import colorScales from "./colorScales"; export {colorScales};

const shaders = Shaders.create({
  colorify: {
    frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform sampler2D children, colorScale;
float greyscale (vec3 c) { return 0.2125 * c.r + 0.7154 * c.g + 0.0721 * c.b; }
void main() {
  vec4 original = texture2D(children, uv);
  vec4 newcolor = texture2D(colorScale, vec2(greyscale(original.rgb), 0.5));
  gl_FragColor = vec4(newcolor.rgb, original.a * newcolor.a);
}\` }
});

export const Colorify =
({ children, colorScale, interpolation }) =>
  <Node
    shader={shaders.colorify}
    uniformsOptions={{ colorScale: { interpolation } }}
    uniforms={{ colorScale, children }}
  />;

export default class Example extends Component {
  render() {
    const { interpolation, color } = this.props;
    return (
    <Surface width={400} height={300}>
      <Colorify colorScale={colorScales[color]} interpolation={interpolation}>
        https://i.imgur.com/iPKTONG.jpg
      </Colorify>
    </Surface>
    );
  }
  static defaultProps = {
    interpolation: "linear",
    color: Object.keys(colorScales)[0],
  };
}
`;
export const colorscale={ Example: colorscale_E, source: colorscale_s, ...colorscale_m };
import distortion_E from "./distortion";
import * as distortion_m from "./distortion/meta";
const distortion_s = `
import React, { Component } from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import timeLoop from "../../HOC/timeLoop";

const shaders = Shaders.create({
  vignetteColorSeparationDistortion: {
    frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
uniform vec2 mouse;
uniform float time, amp, freq, moving;
vec2 lookup (vec2 offset, float amp2) {
  return mod(
    uv + amp2 * amp * vec2(
      cos(freq*(uv.x+offset.x)+time),
      sin(freq*(uv.y+offset.x)+time))
      + vec2(
        moving * time/10.0,
        0.0),
    vec2(1.0));
}
void main() {
  float dist = distance(uv, mouse);
  float amp2 = pow(1.0 - dist, 2.0);
  float colorSeparation = 0.02 * mix(amp2, 1.0, 0.5);
  vec2 orientation = vec2(1.0, 0.0);
  float a = (1.0-min(0.95, pow(1.8 * distance(uv, mouse), 4.0) +
  0.5 * pow(distance(fract(50.0 * uv.y), 0.5), 2.0)));
  gl_FragColor = vec4(a * vec3(
    texture2D(t, lookup(colorSeparation * orientation, amp2)).r,
    texture2D(t, lookup(-colorSeparation * orientation, amp2)).g,
    texture2D(t, lookup(vec2(0.0), amp2)).b),
    1.0);
}\` }
});


const Vignette = timeLoop(({ children: t, time, mouse }) =>
  <Node
    shader={shaders.vignetteColorSeparationDistortion}
    uniforms={{
      t,
      time: time / 1000, // seconds is better for float precision
      mouse,
      freq: 10 + 2 * Math.sin(0.0007*time),
      amp: 0.05 + Math.max(0, 0.03*Math.cos(0.001 * time)),
      moving: 0,
    }}
  />);

export default class Example extends Component {
  state = {
    mouse: [ 0.5, 0.5 ]
  };
  render() {
    const { mouse } = this.state;
    return (
      <Surface width={500} height={400} onMouseMove={this.onMouseMove}>
        <Vignette mouse={mouse}>
          https://i.imgur.com/2VP5osy.jpg
        </Vignette>
      </Surface>
    );
  }
  onMouseMove = (e) => {
    const rect = e.target.getBoundingClientRect();
    this.setState({
      mouse: [
        (e.clientX - rect.left) / rect.width,
        (rect.bottom - e.clientY) / rect.height,
      ]
    });
  }
};
`;
export const distortion={ Example: distortion_E, source: distortion_s, ...distortion_m };
import transitions_E from "./transitions";
import * as transitions_m from "./transitions/meta";
const transitions_s = `
import React, { Component } from "react";
import { Shaders, Node, LinearCopy, connectSize } from "gl-react";
import { Surface } from "gl-react-dom";
import timeLoop from "../../HOC/timeLoop";
import {shadersDefs, randomTransition} from "./transitions";
const shaders = Shaders.create(shadersDefs);

const Transition = connectSize(
({ shader, progress, from, to, uniforms, width, height }) =>
  <Node
    shader={shader}
    uniforms={{ progress, from, to, ...uniforms, resolution: [width,height] }}
  />);

class Slideshow extends Component {
  state = {
    index: 0,
    transition: randomTransition(),
  };
  componentWillReceiveProps ({ time,slides,slideDuration,transitionDuration }) {
    const index = Math.floor(time / (slideDuration + transitionDuration));
    if (this.state.index !== index) {
      this.setState({
        index,
        transition: randomTransition(),
      });
    }
  }
  render() {
    const { slides, slideDuration, transitionDuration, time } = this.props;
    const { index, transition } = this.state;
    const totalDuration = slideDuration + transitionDuration;
    const progress = Math.max(0,
      (time - index * totalDuration - slideDuration) / transitionDuration);
    const from = slides[index % slides.length];
    const to = slides[(index+1) % slides.length];
    return (
      progress
      ? <Transition
          from={from}
          to={to}
          progress={progress}
          shader={shaders[transition.name]}
          uniforms={transition.uniforms}
        />
      : <LinearCopy>{from}</LinearCopy>
    );
  }
}
const SlideshowLoop = timeLoop(Slideshow);

import images from "./images";
export default() =>
  <Surface width={600} height={400}>
    <SlideshowLoop
      slides={images}
      slideDuration={2000}
      transitionDuration={1500}
    />
  </Surface>
`;
export const transitions={ Example: transitions_E, source: transitions_s, ...transitions_m };
import textfunky_E from "./textfunky";
import * as textfunky_m from "./textfunky/meta";
const textfunky_s = `
//@flow
import React, { Component } from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import JSON2D from "react-json2d";

const shaders = Shaders.create({
  funky: {
    frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
void main() {
  gl_FragColor = texture2D(t, uv) * vec4(
    0.5 + 0.5 * cos(uv.x * 30.0),
    0.5 + 0.5 * sin(uv.y * 20.0),
    0.7 + 0.3 * sin(uv.y * 8.0),
    1.0);
}\` }
});
const Funky = ({children: t}) => <Node shader={shaders.funky} uniforms={{t}} />;

export default class Example extends Component {
  render() {
    return (
      <Surface width={400} height={200}>
        <Funky>
          <JSON2D width={400} height={200}>
          {{
            background: "#000",
            size: [ 400, 200 ],
            draws: [
              {
                textAlign: "center",
                fillStyle: "#fff",
                font: "48px bold Arial",
              },
              [ "fillText",
                "Hello World\\n2d canvas text\\ninjected as texture",
                200,
                60,
                56 ],
            ],
          }}
          </JSON2D>
        </Funky>
      </Surface>
    );
  }
};
`;
export const textfunky={ Example: textfunky_E, source: textfunky_s, ...textfunky_m };
import textanimated_E from "./textanimated";
import * as textanimated_m from "./textanimated/meta";
const textanimated_s = `
//@flow
import React, { PureComponent, Component } from "react";
import { Shaders, Node, GLSL, LinearCopy } from "gl-react";
import { Surface } from "gl-react-dom";
import JSON2D from "react-json2d";
import timeLoop from "../../HOC/timeLoop";

const shaders = Shaders.create({
  animated: {
    frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
uniform float time, amp, freq, colorSeparation, moving;
vec2 lookup (vec2 offset) {
  return mod(
    uv + amp * vec2(
        cos(freq*(uv.x+offset.x)+time/1000.0),
        sin(freq*(uv.y+offset.x)+time/1000.0))
      + vec2( moving * time/10000.0, 0.0),
    vec2(1.0));
}
void main() {
  vec3 col =  mix(vec3(
    texture2D(t, lookup(vec2(colorSeparation))).r,
    texture2D(t, lookup(vec2(-colorSeparation))).g,
    texture2D(t, lookup(vec2(0.0))).b),  vec3(1.0), 0.1);
  gl_FragColor = vec4(col * vec3(
    0.5 + 0.5 * cos(uv.y + uv.x * 49.0),
    0.6 * uv.x + 0.2 * sin(uv.y * 30.0),
    1.0 - uv.x + 0.5 * cos(uv.y * 2.0)
  ), 1.0);
}\`
  }
});

class Animated extends Component {
  render() {
    const { children: t, time } = this.props;
    return <Node
      shader={shaders.animated}
      uniforms={{
        t,
        time,
        freq: 20 - 14 * Math.sin(time / 7000),
        amp: 0.05 * (1 - Math.cos(time / 4000)),
        colorSeparation: 0.02,
        moving: 1,
      }}
    />;
  }
}

const AnimatedLoop = timeLoop(Animated);

const size = { width: 500, height: 200 };
const font = "36px bold Helvetica";
const lineHeight = 40;
const padding = 10;

class Text extends PureComponent {
  render() {
    const {text} = this.props;
    return (
    // Text is a PureComponent that renders a LinearCopy
    // that will cache the canvas content for more efficiency
    <LinearCopy>
      <JSON2D {...size}>
      {{
        background: "#000",
        size: [ size.width, size.height ],
        draws: [
          {
            textBaseline: "top",
            fillStyle: "#fff",
            font,
          },
          [ "fillText", text, padding, padding, lineHeight ],
        ],
      }}
      </JSON2D>
    </LinearCopy>
    );
  }
}

export default class Example extends Component {
  render() {
    const { text } = this.props;
    return (
  <Surface {...size}>
    <AnimatedLoop>
      <Text text={text} />
    </AnimatedLoop>
  </Surface>
    );
  }

  static defaultProps = {
    text: "Hello world\\n2d canvas text\\ninjected as texture",
  };
}

export {size,font,lineHeight,padding};
`;
export const textanimated={ Example: textanimated_E, source: textanimated_s, ...textanimated_m };
import glsledit_E from "./glsledit";
import * as glsledit_m from "./glsledit/meta";
const glsledit_s = `
//@flow
import React, { Component } from "react";
import { Node, Visitor, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import timeLoop from "../../HOC/timeLoop";

const Preview = timeLoop(({ frag, visitor, time }) =>
  <Surface width={500} height={200} visitor={visitor}>
    <Node shader={{ frag }} uniforms={{ time: time / 1000 }} />
  </Surface>);

class DisplayError extends Component {
  render() {
    const {error} = this.props;
    if (!error) return <div className="compile success">Compilation success!</div>;
    let err = error.message;
    const i = err.indexOf("ERROR:");
    if (i!==-1) err = "line "+err.slice(i + 9);
    return <div className="compile error">{err}</div>;
  }
}

export default class Example extends Component {
  constructor() {
    super();
    const visitor = new Visitor();
    visitor.onSurfaceDrawError = (error: Error) => {
      this.setState({ error });
      return true;
    };
    visitor.onSurfaceDrawEnd = () => this.setState({ error: null });
    this.state = { error: null, visitor };
  };

  render() {
    const { frag } = this.props;
    const { error, visitor } = this.state;
    return (
    <div>
      <Preview frag={frag} visitor={visitor} />
      <DisplayError error={error} />
    </div>
    );
  }

  props: { frag: string };
  state: { error: ?Error, visitor: Visitor };
  static defaultProps = { // adapted from http://glslsandbox.com/e#27937.0
    frag: GLSL\`precision highp float;
varying vec2 uv;

uniform float time;

void main() {
  float amnt;
  float nd;
  vec4 cbuff = vec4(0.0);
  for(float i=0.0; i<5.0;i++){
    nd = sin(3.17*0.8*uv.x + (i*0.1+sin(+time)*0.2) + time)*0.8+0.1 + uv.x;
    amnt = 1.0/abs(nd-uv.y)*0.01;
    cbuff += vec4(amnt, amnt*0.3 , amnt*uv.y, 90.0);
  }
  for(float i=0.0; i<1.0;i++){
    nd = sin(3.14*2.0*uv.y + i*40.5 + time)*90.3*(uv.y+80.3)+0.5;
    amnt = 1.0/abs(nd-uv.x)*0.015;
    cbuff += vec4(amnt*0.2, amnt*0.2 , amnt*uv.x, 1.0);
  }
  gl_FragColor = cbuff;
}
\`
  };
}
`;
export const glsledit={ Example: glsledit_E, source: glsledit_s, ...glsledit_m };
import paint_E from "./paint";
import * as paint_m from "./paint/meta";
const paint_s = `
import React, { Component } from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";

function getPosition (e) {
  const rect = e.target.getBoundingClientRect();
  return [
    (e.clientX - rect.left) / rect.width,
    (rect.bottom - e.clientY) / rect.height,
  ];
}

const shaders = Shaders.create({
  paint: {
    frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform bool drawing;
uniform vec4 color;
uniform vec2 center;
uniform float brushRadius;
void main() {
  if (drawing) {
    vec2 d = uv - center;
    if (length(d) < brushRadius) {
      gl_FragColor = color;
    }
    else {
      discard;
    }
  }
  else {
    discard;
  }
} \` }
});

export default class Example extends Component {
  state = {
    drawing: false,
    color: [1,0,0,1],
    center: [0.5,0.5],
    brushRadius: 0.04,
  };

  render() {
    return (
      <Surface
        width={500}
        height={500}
        onMouseLeave={this.onMouseLeave}
        onMouseMove={this.onMouseMove}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
        webglContextAttributes={{ preserveDrawingBuffer: true }}
        style={{ cursor: "crosshair" }}>
        <Node
          shader={shaders.paint}
          uniforms={this.state}
          clear={null}
        />
      </Surface>
    );
    // NB: We also need to explicitely use clear=null
    // to disable the Node to clear the framebuffer,
    // and enable preserveDrawingBuffer webgl options.
  }

  onMouseLeave = () => {
    this.setState({ drawing: false });
  };
  onMouseMove = (e) => {
    if (this.state.drawing) {
      this.setState({
        center: getPosition(e),
        brushRadius: 0.03 + 0.01 * Math.cos(Date.now() / 1000),
      });
    }
  };
  onMouseDown = (e) => {
    this.setState({
      drawing: true,
      center: getPosition(e),
      color: [ Math.random(), Math.random(), Math.random(), 1, ],
    });
  };
  onMouseUp = () => {
    this.setState({
      drawing: false,
    });
  };
}
`;
export const paint={ Example: paint_E, source: paint_s, ...paint_m };
import pixeleditor_E from "./pixeleditor";
import * as pixeleditor_m from "./pixeleditor/meta";
const pixeleditor_s = `
//@flow
import React, { PureComponent, Component } from "react";
import ndarray from "ndarray";
import ops from "ndarray-ops";
import { Shaders, Node, GLSL, Bus } from "gl-react";
import { Surface } from "gl-react-dom";
import marioPNG from "./mario.png";
import "./index.css";
type Vec2 = [number,number];

const shaders = Shaders.create({
  paint: {
    frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform vec4 color;
uniform vec2 size, mouse;
uniform float brushRadius;
uniform bool drawing;

void main() {
  vec2 p = floor(uv * size) / size;
  if (drawing) {
    vec2 d = uv - mouse;
    if (length(d) < brushRadius) {
      gl_FragColor = color;
    }
    else {
      discard;
    }
  }
  else {
    discard;
  }
}\`,
  },
  initTexture: {
    frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
void main(){
  gl_FragColor=texture2D(t,uv);
}\`
  },
  pixelEditor: {
    frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform vec4 color;
uniform vec2 size, mouse, gridBorder;
uniform float brushRadius;
uniform sampler2D t;

void main() {
  vec2 p = floor(uv * size) / size;
  vec2 remain = mod(uv * size, vec2(1.0));
  float m =
    step(remain.x, 1.0 - gridBorder.x) *
    step(remain.y, 1.0 - gridBorder.y);
  float inBrushSize =
    step(length(p + (0.5 / size) - mouse), brushRadius);
  vec4 c = mix(texture2D(t, uv), color, 0.6 * inBrushSize);
  gl_FragColor = vec4(
    m * c.rgb,
    mix(1.0, c.a, m));
}\`,
  }
});

class Paint extends PureComponent {
  state = {
    initialized: false,
  };
  componentDidMount() {
    this.setState({
      initialized: true,
    });
  }
  render() {
    const { initialTexture, onPaintNodeRef, ...rest } = this.props;
    const { initialized } = this.state;
    return <Node
      ref={onPaintNodeRef}
      sync={!initialized}
      shader={!initialized ? shaders.initTexture : shaders.paint}
      width={rest.size[0]}
      height={rest.size[1]}
      uniforms={!initialized ? { t: initialTexture } : rest}
      clear={null}
    />;
  }
}

class PixelEditor extends PureComponent {
  render() {
    const { gridBorder, ...rest } = this.props;
    const { size, brushRadius, mouse, color } = rest;
    return (
      <Node
        shader={shaders.pixelEditor}
        uniformsOptions={{
          t: { interpolation: "nearest" }
        }}
        uniforms={{
          size,
          gridBorder,
          brushRadius,
          mouse,
          color,
        }}>
        <Bus uniform="t">
          <Paint {...rest} />
        </Bus>
      </Node>
    );
  }
}


function getPosition (e: any): Vec2 {
  const rect = e.target.getBoundingClientRect();
  return [
    (e.clientX - rect.left) / rect.width,
    (rect.bottom - e.clientY) / rect.height,
  ];
}

const size = [ 16, 16 ];
const gridBorder = [ 1/8, 1/8 ];
const tools = {
  "brush-1": { brushRadius: 0.55 / 16 },
  "brush-2": { brushRadius: 1.1 / 16 },
  "brush-4": { brushRadius: 2.2 / 16 },
  "rubber": { brushRadius: 4 / 16, forceColor: [0,0,0,0] },
  "color-picker": { colorPick: true },
};

export default class Example extends Component {
  state = {
    drawing: false,
    mouse: [ 0.5, 0.5 ],
  };

  render() {
    const { color, toolKey } = this.props;
    const { drawing, mouse } = this.state;
    const tool = tools[toolKey];
    return (
    <div>
      <Surface
        width={128*3}
        height={128*3}
        preload={[ marioPNG ]}
        onMouseLeave={this.onMouseLeave}
        onMouseMove={this.onMouseMove}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
        webglContextAttributes={{ preserveDrawingBuffer: true }}
        style={{ cursor: "crosshair" }}>
        <PixelEditor
          gridBorder={gridBorder}
          initialTexture={marioPNG}
          drawing={drawing}
          color={tool.forceColor || color}
          mouse={mouse}
          brushRadius={tool.brushRadius || 0}
          size={size}
          onPaintNodeRef={this.onPaintNodeRef}
        />
      </Surface>
      <div className="buttons">
        <button onClick={this.onDownload}>DOWNLOAD PNG</button>
      </div>
    </div>
    );
  }

  onColorChange = ({ rgb: { r, g, b, a } }: any) => {
    const color = [ r, g, b ].map(n => n / 255).concat([ a ]);
    this.props.setToolState({ color });
  };

  paintNode: Node;
  onPaintNodeRef = (ref: Node) => {
    this.paintNode = ref;
  }

  onDownload = () => {
    const captured = this.paintNode.capture();
    const canvas = document.createElement("canvas");
    canvas.width = size[0];
    canvas.height = size[1];
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ops.assign(
      ndarray(imageData.data, [canvas.height, canvas.width, 4]).transpose(1, 0, 2),
      captured,
    );
    ctx.putImageData(imageData, 0, 0);
    canvas.toBlob(blob => {
      window.open(window.URL.createObjectURL(blob));
    });
  };

  colorPick = ([ x, y ]: Vec2) => {
    x = Math.floor(x * size[0]);
    y = Math.floor(y * size[1]);
    const ndarray = this.paintNode.capture(x, y, 1, 1);
    this.props.setToolState({
      color: Array.from(ndarray.data).map(n => n / 255),
    });
  };

  onMouseDown = (e: MouseEvent) => {
    const mouse = getPosition(e);
    this.setState({
      drawing: true,
      mouse,
    });
    if (tools[this.props.toolKey].colorPick) {
      this.colorPick(mouse);
    }
  };

  onMouseMove = (e: MouseEvent) => {
    const mouse = getPosition(e);
    this.setState({ mouse });
    if (this.state.drawing && tools[this.props.toolKey].colorPick) {
      this.colorPick(mouse);
    }
  };

  onMouseUp = () => {
    this.setState({
      drawing: false,
    });
  };

  onMouseLeave = () => {
    this.setState({
      drawing: false,
      mouse: [ -1, -1 ],
    });
  };

  static defaultProps = {
    color: [ 1, 1, 1, 1 ],
    toolKey: "brush-4",
  };
}

export {tools};
`;
export const pixeleditor={ Example: pixeleditor_E, source: pixeleditor_s, ...pixeleditor_m };
import blurxy_E from "./blurxy";
import * as blurxy_m from "./blurxy/meta";
const blurxy_s = `
//@flow
import React, { Component } from "react";
import {Shaders, Node, GLSL, connectSize} from "gl-react";
import { Surface } from "gl-react-dom";

const shaders = Shaders.create({
  blur1D: { // blur9: from https://github.com/Jam3/glsl-fast-gaussian-blur
   frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
uniform vec2 direction, resolution;
vec4 blur9(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.3846153846) * direction;
  vec2 off2 = vec2(3.2307692308) * direction;
  color += texture2D(image, uv) * 0.2270270270;
  color += texture2D(image, uv + (off1 / resolution)) * 0.3162162162;
  color += texture2D(image, uv - (off1 / resolution)) * 0.3162162162;
  color += texture2D(image, uv + (off2 / resolution)) * 0.0702702703;
  color += texture2D(image, uv - (off2 / resolution)) * 0.0702702703;
  return color;
}
void main() {
  gl_FragColor = blur9(t, uv, resolution, direction);
}\` }
});

// This implements a blur on a single direction (x or y axis for instance)
// connectSize will inject for us the width/height from context if not provided
export const Blur1D =
  connectSize(({ children: t, direction, width, height }) =>
    <Node
      shader={shaders.blur1D}
      uniforms={{ t, resolution: [ width, height ], direction }}
    />);

// BlurXY is a basic blur that apply Blur1D on Y and then on X
export const BlurXY =
  connectSize(({ factor, children }) =>
    <Blur1D direction={[ factor, 0 ]}>
      <Blur1D direction={[ 0, factor ]}>
        {children}
      </Blur1D>
    </Blur1D>);

export default class Example extends Component {
  render() {
    const { factor } = this.props;
    return (
      <Surface width={400} height={300}>
        <BlurXY factor={factor}>
          https://i.imgur.com/iPKTONG.jpg
        </BlurXY>
      </Surface>
    );
  }
  static defaultProps = {
    factor: 1,
  };
}
`;
export const blurxy={ Example: blurxy_E, source: blurxy_s, ...blurxy_m };
import blurxydownscale_E from "./blurxydownscale";
import * as blurxydownscale_m from "./blurxydownscale/meta";
const blurxydownscale_s = `
//@flow
import React, { Component } from "react";
import {LinearCopy} from "gl-react";
import { Surface } from "gl-react-dom";
import {BlurXY} from "../blurxy";

export default class Example extends Component {
  render() {
    const { factor } = this.props;
    return (
      <Surface width={400} height={300}>
        <LinearCopy>
          <BlurXY factor={factor} width={100} height={75}>
            https://i.imgur.com/iPKTONG.jpg
          </BlurXY>
        </LinearCopy>
      </Surface>
// we have to wrap this in a <LinearCopy> so it upscales to the Surface size.
    );
  }
  static defaultProps = {
    factor: 0.5,
  };
}
`;
export const blurxydownscale={ Example: blurxydownscale_E, source: blurxydownscale_s, ...blurxydownscale_m };
import blurmulti_E from "./blurmulti";
import * as blurmulti_m from "./blurmulti/meta";
const blurmulti_s = `
//@flow
import React, { Component } from "react";
import { connectSize } from "gl-react";
import { Surface } from "gl-react-dom";
import { Blur1D } from "../blurxy";

// empirical strategy to chose a 2d vector for a blur pass
const NORM = Math.sqrt(2)/2;
export const directionForPass = (p: number, factor: number, total: number) => {
  const f = factor * 2 * Math.ceil(p / 2) / total;
  switch ((p-1) % 4) { // alternate horizontal, vertical and 2 diagonals
  case 0: return [f,0];
  case 1: return [0,f];
  case 2: return [f*NORM,f*NORM];
  default: return [f*NORM,-f*NORM];
  }
}

// recursively apply Blur1D to make a multi pass Blur component
export const Blur = connectSize(({ children, factor, passes }) => {
  const rec = pass =>
    pass <= 0
    ? children
    : <Blur1D direction={directionForPass(pass, factor, passes)}>
        {rec(pass-1)}
      </Blur1D>;
  return rec(passes);
});

export default class Example extends Component {
  render() {
    const { factor, passes } = this.props;
    return (
      <Surface width={400} height={300}>
        <Blur passes={passes} factor={factor}>
          https://i.imgur.com/iPKTONG.jpg
        </Blur>
      </Surface>
    );
  }
  static defaultProps = {
    factor: 2,
    passes: 4,
  };
}
`;
export const blurmulti={ Example: blurmulti_E, source: blurmulti_s, ...blurmulti_m };
import blurmap_E from "./blurmap";
import * as blurmap_m from "./blurmap/meta";
const blurmap_s = `
//@flow
import React, { Component } from "react";
import { Shaders, Node, GLSL, connectSize } from "gl-react";
import { Surface } from "gl-react-dom";

const shaders = Shaders.create({
  blurV1D: {
    frag: GLSL\`precision highp float;
varying vec2 uv;
uniform sampler2D t, map;
uniform vec2 direction, resolution;
vec4 blur9(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.3846153846) * direction;
  vec2 off2 = vec2(3.2307692308) * direction;
  color += texture2D(image, uv) * 0.2270270270;
  color += texture2D(image, uv + (off1 / resolution)) * 0.3162162162;
  color += texture2D(image, uv - (off1 / resolution)) * 0.3162162162;
  color += texture2D(image, uv + (off2 / resolution)) * 0.0702702703;
  color += texture2D(image, uv - (off2 / resolution)) * 0.0702702703;
  return color;
}
void main() {
  gl_FragColor = blur9(t, uv, resolution, direction * texture2D(map, uv).rg);
}\`
 }
});

// Same concept than Blur1D except it takes one more prop:
// a map texture that tells the blur intensity for a given position.
export const BlurV1D =
  connectSize(({ children: t, direction, map, width, height }) =>
    <Node
      shader={shaders.blurV1D}
      uniforms={{ t, map, resolution: [ width, height ], direction }}
    />);

// And its N-pass version
import {directionForPass} from "../blurmulti";
export const BlurV =
  connectSize(({ children, factor, map, passes }) => {
    const rec = pass =>
    pass <= 0
    ? children
    : <BlurV1D map={map} direction={directionForPass(pass, factor, passes)}>
        {rec(pass-1)}
      </BlurV1D>;
    return rec(passes);
  });

export default class Example extends Component {
  render() {
    const { factor, passes, map } = this.props;
    return (
      <Surface width={600} height={284}>
        <BlurV map={map} passes={passes} factor={factor}>
          https://i.imgur.com/NjbLHx2.jpg
        </BlurV>
      </Surface>
    );
  }
  static defaultProps = {
    factor: 2,
    passes: 4,
    map: StaticBlurMap.images[0],
  };
};
import StaticBlurMap from "../../toolbox/StaticBlurMap";
`;
export const blurmap={ Example: blurmap_E, source: blurmap_s, ...blurmap_m };
import blurmapmouse_E from "./blurmapmouse";
import * as blurmapmouse_m from "./blurmapmouse/meta";
const blurmapmouse_s = `
//@flow
import React, { Component } from "react";
import { Shaders, Node, Bus, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import {BlurV} from "../blurmap";

const shaders = Shaders.create({
  Offset: {
    frag: GLSL\`precision highp float;
varying vec2 uv;
uniform sampler2D t;
uniform vec2 offset;
void main () {
  gl_FragColor = texture2D(t, uv + offset);
}\`
 }
});

const Offset = ({ t, offset }) =>
  <Node shader={shaders.Offset} uniforms={{ t, offset }} />;

export default class Example extends Component {
  state = {
    offset: [0,0],
  };
  render() {
    const { map } = this.props;
    const { offset } = this.state;
// Sharing computation of a GL Node.
// <Offset /> should not be passed straight to BlurV's map because
// it would duplicates it in the tree ([passes] times)
// Instead, we need to express a graph and share the
// computation with a Bus ref.
// We pass to BlurV's map prop a function that resolve that ref.
    return (
      <Surface
        width={600}
        height={284}
        onMouseMove={this.onMouseMove}
        onMouseLeave={this.onMouseLeave}>
        <Bus ref="blurMapBus">
          <Offset offset={offset} t={map} />
        </Bus>
        <BlurV map={()=>this.refs.blurMapBus} passes={6} factor={6}>
          https://i.imgur.com/NjbLHx2.jpg
        </BlurV>
      </Surface>
    );
  }
  onMouseMove = (e: *) => {
    const rect = e.target.getBoundingClientRect();
    this.setState({ offset: [
      -(e.clientX - rect.left - rect.width/2) / rect.width,
      (e.clientY - rect.top - rect.height/2) / rect.height
    ] });
  };
  onMouseLeave = () => this.setState({ offset: [0,0] });
  static defaultProps = {
    map: StaticBlurMap.images[0],
  };
};
import StaticBlurMap from "../../toolbox/StaticBlurMap";
`;
export const blurmapmouse={ Example: blurmapmouse_E, source: blurmapmouse_s, ...blurmapmouse_m };
import blurmapdyn_E from "./blurmapdyn";
import * as blurmapdyn_m from "./blurmapdyn/meta";
const blurmapdyn_s = `
//@flow
import React, { Component } from "react";
import { Shaders, Node, Bus, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import {BlurV} from "../blurmap";
import timeLoop from "../../HOC/timeLoop";

const shaders = Shaders.create({
  ConicalGradiant: {
    frag: GLSL\`precision highp float;
varying vec2 uv;
uniform float phase;
const float PI = 3.14159;
void main () {
  gl_FragColor = vec4(vec3(
    mod(phase + atan(uv.x-0.5, uv.y-0.5)/(2.0*PI), 1.0)
  ), 1.0);
}\` }
});

const ConicalGradiantLoop = timeLoop(({ time }) =>
  <Node
    shader={shaders.ConicalGradiant}
    uniforms={{ phase: time/3000 }}
  />);

export default class Example extends Component {
  render() {
    const { factor, passes } = this.props;
    // <ConicalGradiant/> also needs to be computed once.
    return (
      <Surface width={600} height={284}>
        <Bus ref="blurMapBus">
          <ConicalGradiantLoop />
        </Bus>
        <BlurV map={() => this.refs.blurMapBus} passes={passes} factor={factor}>
          https://i.imgur.com/NjbLHx2.jpg
        </BlurV>
      </Surface>
    );
  }
  static defaultProps = {
    factor: 6,
    passes: 4,
  };
};
`;
export const blurmapdyn={ Example: blurmapdyn_E, source: blurmapdyn_s, ...blurmapdyn_m };
import blurimgtitle_E from "./blurimgtitle";
import * as blurimgtitle_m from "./blurimgtitle/meta";
const blurimgtitle_s = `
//@flow
import React, { PureComponent, Component, PropTypes } from "react";
import { Shaders, Node, GLSL, Bus, LinearCopy, connectSize } from "gl-react";
import { Surface } from "gl-react-dom";
import JSON2D from "react-json2d";
import {Blur1D} from "../blurxy";
import {Blur} from "../blurmulti";
import {BlurV} from "../blurmap";

const shaders = Shaders.create({
  ImageTitle: {
    frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform sampler2D img, imgBlurred, imgTone, title, blurMap;
uniform float colorThreshold;
float monochrome (vec3 c) {
  return 0.2125 * c.r + 0.7154 * c.g + 0.0721 * c.b;
}
void main() {
  float blurFactor = texture2D(blurMap, uv).r;
  vec4 bgColor = mix(
    texture2D(img, uv),
    texture2D(imgBlurred, uv),
    step(0.01, blurFactor)
  );
  vec4 textColor = vec4(vec3(
    step(monochrome(texture2D(imgTone, uv).rgb), colorThreshold)
  ), 1.0);
  float isText = 1.0 - texture2D(title, uv).r;
  gl_FragColor = mix(bgColor, textColor, isText);
}\`
  },
  TitleBlurMap: {
    frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
uniform float threshold;
void main() {
gl_FragColor = vec4(
  vec3(smoothstep(1.0, threshold, texture2D(t, uv).r)),
  1.0);
}\`
  },
});

const AveragePixels = ({ children, quality }) =>
  <Blur1D
    width={1}
    height={1}
    resolution={[ 1, 1 ]}
    direction={[ 0, 0.1 ]}>
    <Blur1D
      width={1}
      height={quality}
      resolution={[ 1, quality ]}
      direction={[ 0.1, 0 ]}>
      {children}
    </Blur1D>
  </Blur1D>;

const TitleBlurMap = ({ children: title, threshold }) =>
  <Node
    shader={shaders.TitleBlurMap}
    uniforms={{
      threshold,
      t:
        <Blur factor={4} passes={4} width={200} height={200}>
          {title}
        </Blur>
    }}
    width={64}
    height={64}
  />;

class Title extends PureComponent {
  render () {
    const { children, width, height } = this.props;
    return <LinearCopy><JSON2D width={width} height={height}>{{
      size: [ width, height ],
      background: "#fff",
      draws: [
        {
          "font": "bold 78px Didot,Georgia,serif",
          "fillStyle": "#000",
          "textBaseline": "top",
          "textAlign": "center"
        },
        [ "fillText", children, width/2, 10, 84 ],
      ]
    }}</JSON2D></LinearCopy>;
  }
}

class ImageTitleC extends Component {
  static propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    children: PropTypes.any.isRequired,
    text: PropTypes.string.isRequired,
    colorThreshold: PropTypes.number.isRequired,
  };
  render() {
    const { width, height, children: img, text, colorThreshold } = this.props;
    return (
    <Node
      shader={shaders.ImageTitle}
      uniforms={{
        colorThreshold,
        img,
        imgBlurred:() => this.refs.imgBlurred,
        title:() => this.refs.title,
        imgTone:() => this.refs.imgTone,
        blurMap:() => this.refs.blurMap,
      }}>

      <Bus ref="title">
        <Title width={width} height={height}>
          {text}
        </Title>
      </Bus>

      <Bus ref="blurMap">
        <TitleBlurMap threshold={0.7}>
          {() => this.refs.title}
        </TitleBlurMap>
      </Bus>

      <Bus ref="imgTone">
        <AveragePixels quality={8}>
          {img}
        </AveragePixels>
      </Bus>

      <Bus ref="imgBlurred">
        <BlurV
          map={() => this.refs.blurMap}
          factor={4}
          passes={4}>
          {img}
        </BlurV>
      </Bus>

    </Node>
    );
  }
}
const ImageTitle = connectSize(ImageTitleC);

export default class Example extends Component {
  render() {
    const { title, colorThreshold, image } = this.props;
    return (
    <Surface width={450} height={300}>
      <ImageTitle text={title} colorThreshold={colorThreshold}>
        {image}
      </ImageTitle>
    </Surface>
    );
  }

  static defaultProps = {
    title: "Hello\\nSan Francisco\\n☻",
    colorThreshold: 0.6,
    image: require("./sf-6.jpg"),
  };
}
`;
export const blurimgtitle={ Example: blurimgtitle_E, source: blurimgtitle_s, ...blurimgtitle_m };
import gol_E from "./gol";
import * as gol_m from "./gol/meta";
const gol_s = `
//@flow
import React from "react";
import {Backbuffer,Shaders,Node,GLSL,NearestCopy} from "gl-react";
import { Surface } from "gl-react-dom";
import timeLoop from "../../HOC/timeLoop";

export const shaders = Shaders.create({
  InitGameOfLife: {
// returns white or black randomly
    frag: GLSL\`
precision highp float;
// i
varying vec2 uv;
float random (vec2 uv) {
  return fract(sin(dot(uv, vec2(12.9898,78.233))) * 43758.5453);
}
// i
void main() {
  gl_FragColor = vec4(vec3(step(0.5, random(uv))), 1.0);
}\`
  },
  GameOfLife: {
// implement Game Of Life.
    frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform float size;
uniform sampler2D t; // the previous world state
void main() {
  float prev = step(0.5, texture2D(t, uv).r);
  float c = 1.0 / size;
  float sum =
  step(0.5, texture2D(t, uv + vec2(-1.0, -1.0)*c).r) +
  step(0.5, texture2D(t, uv + vec2(-1.0,  0.0)*c).r) +
  step(0.5, texture2D(t, uv + vec2(-1.0,  1.0)*c).r) +
  step(0.5, texture2D(t, uv + vec2( 0.0,  1.0)*c).r) +
  step(0.5, texture2D(t, uv + vec2( 1.0,  1.0)*c).r) +
  step(0.5, texture2D(t, uv + vec2( 1.0,  0.0)*c).r) +
  step(0.5, texture2D(t, uv + vec2( 1.0, -1.0)*c).r) +
  step(0.5, texture2D(t, uv + vec2( 0.0, -1.0)*c).r);
  float next = prev==1.0 && sum >= 2.0 && sum <= 3.0 || sum == 3.0 ? 1.0 : 0.0;
  gl_FragColor = vec4(vec3(next), 1.0);
}\`
  }
});

const refreshEveryTicks = 20;

export const GameOfLife = ({ tick }) => {
  // Changing size is "destructive" and will reset the Game of Life state
  const size = 16 * (1+Math.floor(tick/refreshEveryTicks));
  // However, we can conditionally change shader/uniforms,
  // React reconciliation will preserve the same <Node> instance,
  // and our Game of Life state will get preserved!
  return tick%refreshEveryTicks===0
  ? <Node
    shader={shaders.InitGameOfLife}
    width={size}
    height={size}
    backbuffering // makes Node holding 2 fbos that get swapped each draw time
    sync // force <Node> to draw in sync each componentDidUpdate time
  />
  : <Node
    shader={shaders.GameOfLife}
    width={size}
    height={size}
    backbuffering
    sync
    uniforms={{
      t: Backbuffer, // Use previous frame buffer as a texture
      size,
    }}
  />;
};

const GameOfLifeLoop = timeLoop(GameOfLife, { refreshRate: 20 });

export default () =>
  <Surface width={384} height={384}>
    <NearestCopy>
      <GameOfLifeLoop />
    </NearestCopy>
  </Surface>
`;
export const gol={ Example: gol_E, source: gol_s, ...gol_m };
import golglider_E from "./golglider";
import * as golglider_m from "./golglider/meta";
const golglider_s = `
//@flow
import React, { Component } from "react";
import { Backbuffer, Node, NearestCopy } from "gl-react";
import { Surface } from "gl-react-dom";
import {shaders} from "../gol";
import timeLoop from "../../HOC/timeLoop";
import gliderGunImage from "./glider-gun-64.png";

const GameOfLifeLoop = timeLoop(({ tick, size }) =>
  <Node
    shader={shaders.GameOfLife}
    width={size}
    height={size}
    backbuffering
    sync
    uniforms={{
      t: tick===0 ? gliderGunImage : Backbuffer,
      size,
    }}
  />, { refreshRate: 20 });

export default class Example extends Component {
  render() {
    return (
      <Surface
        width={500}
        height={500}
        preload={[ // preload textures before starting rendering
          gliderGunImage
        ]}>
        <NearestCopy>
          <GameOfLifeLoop size={64} />
        </NearestCopy>
      </Surface>
    );
  }
}
`;
export const golglider={ Example: golglider_E, source: golglider_s, ...golglider_m };
import golrot_E from "./golrot";
import * as golrot_m from "./golrot/meta";
const golrot_s = `
//@flow
import React from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import timeLoop from "../../HOC/timeLoop";
import {GameOfLife} from "../gol";

const shaders = Shaders.create({
  Rotating: {
    frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform float angle, scale;
uniform sampler2D children;
void main() {
  mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  vec2 p = (uv - vec2(0.5)) * rotation / scale + vec2(0.5);
  gl_FragColor =
    p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0
    ? vec4(0.0)
    : texture2D(children, p);
}\` }
});

export const Rotating = ({ angle, scale, children }) =>
  <Node
    shader={shaders.Rotating}
    uniformsOptions={{ children: { interpolation: "nearest" } }}
    uniforms={{ angle, scale, children }}
  />;

const RotatingLoop = timeLoop(({ time, children }) => Rotating({
  angle: (time / 1000) % (2 * Math.PI),
  scale: 0.6 + 0.15 * Math.cos(time / 500),
  children,
}));

const GameOfLifeLoop = timeLoop(GameOfLife, { refreshRate: 5 });

export default () =>
  <Surface width={500} height={500}>
    <RotatingLoop>
      <GameOfLifeLoop />
    </RotatingLoop>
  </Surface>;
`;
export const golrot={ Example: golrot_E, source: golrot_s, ...golrot_m };
import golrotscu_E from "./golrotscu";
import * as golrotscu_m from "./golrotscu/meta";
const golrotscu_s = `
//@flow
import React, { Component } from "react";
import { Surface } from "gl-react-dom";
import timeLoop from "../../HOC/timeLoop";
import {GameOfLife} from "../gol";
import {Rotating} from "../golrot";

class PureGameOfLife extends Component {
  shouldComponentUpdate ({ tick }) { // only tick should trigger redraw
    return tick !== this.props.tick;
  }
  render() {
    return <GameOfLife tick={this.props.tick} />;
  }
}

const RotatingGameOfLife = ({ time }) =>
  <Rotating
    angle={(time / 1000) % (2 * Math.PI)}
    scale={0.6 + 0.15 * Math.cos(time / 500)}>

    <PureGameOfLife tick={Math.floor(time / 200)} />

  </Rotating>;

export const RotatingGameOfLifeLoop = timeLoop(RotatingGameOfLife);

export default class Example extends Component {
  render() {
    return (
      <Surface width={500} height={500}>
        <RotatingGameOfLifeLoop />
      </Surface>
    );
  }
}
`;
export const golrotscu={ Example: golrotscu_E, source: golrotscu_s, ...golrotscu_m };
import video_E from "./video";
import * as video_m from "./video/meta";
const video_s = `
//@flow
import React, { Component } from "react";
import { Shaders, GLSL, Node } from "gl-react";
import { Surface } from "gl-react-dom";
import videoMP4 from "./video.mp4"; export {videoMP4};

// We implement a component <Video> that is like <video>
// but provides a onFrame hook so we can efficiently only render
// if when it effectively changes.
import raf from "raf";
export class Video extends Component {
  componentDidMount() {
    const loop = () => {
      this._raf = raf(loop);
      const {video} = this.refs;
      if (!video) return;
      const currentTime = video.currentTime;
      // Optimization that only call onFrame if time changes
      if (currentTime !== this.currentTime) {
        this.currentTime = currentTime;
        this.props.onFrame(currentTime);
      }
    };
    this._raf = raf(loop);
  }
  componentWillUnmount() {
    raf.cancel(this._raf);
  }
  render() {
    const { onFrame, ...rest } = this.props;
    return <video {...rest} ref="video" />;
  }
}

// Our example will simply split R G B channels of the video.
const shaders = Shaders.create({
  SplitColor: {
    frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform sampler2D children;
void main () {
  float y = uv.y * 3.0;
  vec4 c = texture2D(children, vec2(uv.x, mod(y, 1.0)));
  gl_FragColor = vec4(
    c.r * step(2.0, y) * step(y, 3.0),
    c.g * step(1.0, y) * step(y, 2.0),
    c.b * step(0.0, y) * step(y, 1.0),
    1.0);
}\` }
//^NB perf: in fragment shader paradigm, we want to avoid code branch (if / for)
// and prefer use of built-in functions and just giving the GPU some computating.
// step(a,b) is an alternative to do if(): returns 1.0 if a<b, 0.0 otherwise.
});
const SplitColor = ({ children }) =>
  <Node shader={shaders.SplitColor} uniforms={{ children }} />;

// We now uses <Video> in our GL graph.
// The texture we give to <SplitColor> is a (redraw)=><Video> function.
// redraw is passed to Video onFrame event and Node gets redraw each video frame.
export default () =>
  <Surface width={280} height={630} pixelRatio={1}>
    <SplitColor>
      { redraw =>
        <Video onFrame={redraw} autoPlay loop>
          <source type="video/mp4" src={videoMP4} />
        </Video> }
    </SplitColor>
  </Surface>
`;
export const video={ Example: video_E, source: video_s, ...video_m };
import blurvideo_E from "./blurvideo";
import * as blurvideo_m from "./blurvideo/meta";
const blurvideo_s = `
//@flow
import React, { Component } from "react";
import { Bus } from "gl-react";
import { Surface } from "gl-react-dom";
import {BlurV} from "../blurmap";
import {Saturate} from "../saturation";
import {Video, videoMP4} from "../video";

// We must use a <Bus> if we don't want the <video> element to be duplicated
// per Blur pass.. Also since we can dynamically change the number of passes,
// it changes the tree level, (e.g. Blur1D>Blur1D>video becomes Blur1D>video)
// and React always destroys and recreates the instance during reconcialition.

export default class Example extends Component {
  render() {
    const { factor, passes, contrast, saturation, brightness, map } = this.props;
    return (
<Surface width={480} height={360} pixelRatio={1}>
  <Bus ref="vid">
    <Saturate contrast={contrast} saturation={saturation} brightness={brightness}>
      { redraw =>
        <Video onFrame={redraw} autoPlay loop>
          <source type="video/mp4" src={videoMP4} />
        </Video> }
    </Saturate>
  </Bus>
  <BlurV map={map} passes={passes} factor={factor}>
    { // as a texture, we give a function that resolve the video ref
      () => this.refs.vid
    }
  </BlurV>
</Surface>
    );
  }

  static defaultProps = {
    contrast: 1,
    saturation: 1,
    brightness: 1,
    factor: 2,
    passes: 4,
    map: StaticBlurMap.images[0],
  };
}
import StaticBlurMap from "../../toolbox/StaticBlurMap";
`;
export const blurvideo={ Example: blurvideo_E, source: blurvideo_s, ...blurvideo_m };
import webcam_E from "./webcam";
import * as webcam_m from "./webcam/meta";
const webcam_s = `
//@flow
import React, { Component } from "react";
import { Surface } from "gl-react-dom";
import { Video } from "../video";
import { Colorify, colorScales } from "../colorscale";

// We can give our [<Video>](/blurvideo) component a <WebCamSource> to have webcam stream!
export class WebCamSource extends Component {
  state = { src: null };
  componentWillMount() {
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream =>
      this.setState({ src: URL.createObjectURL(stream) }));
  }
  render() {
    const {src} = this.state;
    return src ? <source src={src} /> : null;
  }
}

export default class Example extends Component {
  render() {
    const { interpolation, color } = this.props;
    return (
    <Surface width={480} height={360}>
      <Colorify colorScale={colorScales[color]} interpolation={interpolation}>
        {redraw =>
          <Video onFrame={redraw} autoPlay>
            <WebCamSource />
          </Video> }
      </Colorify>
    </Surface>
    );
  }

  static defaultProps = {
    interpolation: "linear",
    color: Object.keys(colorScales)[0],
  };
}
`;
export const webcam={ Example: webcam_E, source: webcam_s, ...webcam_m };
import webcampersistence_E from "./webcampersistence";
import * as webcampersistence_m from "./webcampersistence/meta";
const webcampersistence_s = `
//@flow
import React, { Component } from "react";
import { Backbuffer, LinearCopy, Node, Shaders, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import { Video } from "../video";
import { WebCamSource } from "../webcam";

const shaders = Shaders.create({
  Persistence: {
    frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform sampler2D t, back;
uniform float persistence;
void main () {
  gl_FragColor = vec4(mix(
    texture2D(t, uv),
    texture2D(back, uv+vec2(0.0, 0.005)),
    persistence
  ).rgb, 1.0);
}\` }
});

const Persistence = ({ children: t, persistence }) =>
  <Node
    shader={shaders.Persistence}
    backbuffering
    uniforms={{ t, back: Backbuffer, persistence }}
  />;

export default class Example extends Component {
  render() {
    const {persistence} = this.props;
    return (
      <Surface width={400} height={300}>
        <LinearCopy>
          <Persistence persistence={persistence}>{ redraw =>
            <Video onFrame={redraw} autoPlay>
              <WebCamSource />
            </Video>
          }</Persistence>
        </LinearCopy>
      </Surface>
    );
  }
  static defaultProps = {
    persistence: 0.8,
  };
}
`;
export const webcampersistence={ Example: webcampersistence_E, source: webcampersistence_s, ...webcampersistence_m };
import golwebcam_E from "./golwebcam";
import * as golwebcam_m from "./golwebcam/meta";
const golwebcam_s = `
//@flow
import React, { Component } from "react";
import { Bus, Backbuffer, Node, Shaders, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import { Video } from "../video";
import { WebCamSource } from "../webcam";
import { shaders } from "../gol";
import timeLoop from "../../HOC/timeLoop";

const extraShaders = Shaders.create({
  Display: {
    frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform sampler2D gol, webcam;
void main () {
  vec3 webcamC = texture2D(webcam, uv).rgb;
  gl_FragColor = vec4(
    vec3(1.0) * texture2D(gol, uv).r +
    webcamC * mix(step(0.5, webcamC.r), 0.9, 0.2),
  1.0);
}
    \`,
  },
});

const Display = ({ gol, webcam }) =>
  <Node
    shader={extraShaders.Display}
    uniformsOptions={{ gol: { interpolation: "nearest" } }}
    uniforms={{ gol, webcam }}
  />;

const GameOfLife = ({ size, reset, resetTexture }) =>
  <Node
    shader={shaders.GameOfLife}
    width={size}
    height={size}
    backbuffering
    sync
    uniforms={{
      t: reset ? resetTexture : Backbuffer,
      size,
    }}
  />;

const GameOfLifeLoop = timeLoop(GameOfLife, {
  refreshRate: 4
});

export default class Example extends Component {
  state = { reset: false, size: 32 };
  render() {
    const { reset, size } = this.state;
    return (
    <Surface
      style={{ cursor: "pointer" }}
      width={400}
      height={400}
      onMouseDown={this.onMouseDown}
      onMouseUp={this.onMouseUp}>

      <Bus ref="webcam">{ redraw =>
        <Video onFrame={redraw} autoPlay>
          <WebCamSource />
        </Video>
      }</Bus>

      <Display
        gol={
          <GameOfLifeLoop
            reset={reset}
            size={size}
            resetTexture={() => this.refs.webcam}
          />
        }
        webcam={() => this.refs.webcam}
      />
    </Surface>
    );
  }
  onMouseDown = () =>
    this.setState({ reset: true, size: Math.floor(10 + 200*Math.random()*Math.random()) });
  onMouseUp = () =>
    this.setState({ reset: false });
}
`;
export const golwebcam={ Example: golwebcam_E, source: golwebcam_s, ...golwebcam_m };
import mergechannels_E from "./mergechannels";
import * as mergechannels_m from "./mergechannels/meta";
const mergechannels_s = `
//@flow
import React, { Component } from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";

const shaders = Shaders.create({
  mergeChannels: {
    frag: GLSL\`precision highp float;
varying vec2 uv;
uniform sampler2D channels[3];
float monochrome (vec3 c) {
  return 0.2125 * c.r + 0.7154 * c.g + 0.0721 * c.b;
}
void main() {
  gl_FragColor = vec4(
    monochrome(texture2D(channels[0], uv).rgb),
    monochrome(texture2D(channels[1], uv).rgb),
    monochrome(texture2D(channels[2], uv).rgb),
    1.0
  );
}\`
 }
});

export class MergeChannels extends Component {
  render() {
    const { red, green, blue } = this.props;
    return <Node
      shader={shaders.mergeChannels}
      uniforms={{
        channels: [ red, green, blue ]
      }}
    />;
  }
}

export default class Example extends Component {
  render() {
    const { red, green, blue } = this.props;
    return (
      <Surface width={400} height={400}>
        <MergeChannels
          red={red}
          green={green}
          blue={blue}
        />
      </Surface>
    );
  }

  static defaultProps = {
    red: require("./img1.png"),
    green: require("./img2.png"),
    blue: require("./img3.png"),
  };
};
`;
export const mergechannels={ Example: mergechannels_E, source: mergechannels_s, ...mergechannels_m };
import mergechannelsfun_E from "./mergechannelsfun";
import * as mergechannelsfun_m from "./mergechannelsfun/meta";
const mergechannelsfun_s = `
//@flow
import React from "react";
import { Surface } from "gl-react-dom";
import JSON2D from "react-json2d";
import { MergeChannels } from "../mergechannels";
import {Video, videoMP4} from "../video";
import {RotatingGameOfLifeLoop} from "../golrotscu";

export default () =>
  <Surface width={400} height={400}>
    <MergeChannels
      green={
        <RotatingGameOfLifeLoop size={32} />
      }
      blue={ redraw =>
        <Video onFrame={redraw} autoPlay loop>
          <source type="video/mp4" src={videoMP4} />
        </Video>
      }
      red={
        <JSON2D width={400} height={400}>{{
          background: "#000",
          size: [ 400, 400 ],
          draws: [
            { textAlign: "center",
              fillStyle: "#fff",
              font: "48px bold Arial" },
            [ "fillText",
              "Hello World\\n2d canvas text\\ninjected as texture",
              200, 160, 60 ]
          ]
        }}</JSON2D>
      }
    />
  </Surface>;
`;
export const mergechannelsfun={ Example: mergechannelsfun_E, source: mergechannelsfun_s, ...mergechannelsfun_m };
import demotunnel_E from "./demotunnel";
import * as demotunnel_m from "./demotunnel/meta";
const demotunnel_s = `
//@flow
import React from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import timeLoop from "../../HOC/timeLoop";

const shaders = Shaders.create({
  squareTunnel: {
// from https://en.wikipedia.org/wiki/Shadertoy
    frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform float iGlobalTime;
void main() {
  vec2 p = 2.0 * uv - vec2(1.0);
  float a = atan(p.y,p.x);
  float r = pow( pow(p.x*p.x,4.0) + pow(p.y*p.y,4.0), 1.0/8.0 );
  vec2 uv = vec2( 1.0/r + 0.2*iGlobalTime, a );
  float f = cos(12.0*uv.x)*cos(6.0*uv.y);
  vec3 col = 0.5 + 0.5*sin( 3.1416*f + vec3(0.0,0.5,1.0) );
  col = col*r;
  gl_FragColor = vec4( col, 1.0 );
}\` }
});

const SquareTunnel = ({ time }) =>
  <Node
    shader={shaders.squareTunnel}
    uniforms={{ iGlobalTime: time / 1000 }}
  />

const DesertPassageLoop = timeLoop(SquareTunnel);

export default() =>
  <Surface width={400} height={400}>
    <DesertPassageLoop />
  </Surface>
`;
export const demotunnel={ Example: demotunnel_E, source: demotunnel_s, ...demotunnel_m };
import demodesert_E from "./demodesert";
import * as demodesert_m from "./demodesert/meta";
const demodesert_s = `
//@flow
import React from "react";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-dom";
import timeLoop from "../../HOC/timeLoop";
import shadertoyTex17jpg from "./shadertoy-tex17.jpg";

const shaders = Shaders.create({
  desertPassage: {
// from https://www.shadertoy.com/view/XtyGzc
    frag: GLSL\`
precision mediump float;
varying vec2 uv;
uniform float iGlobalTime;
uniform sampler2D iChannel0;
#define FAR 80.
mat2 rot2( float th ){ vec2 a = sin(vec2(1.5707963, 0) + th); return mat2(a, -a.y, a.x); }
float hash( float n ){ return fract(cos(n)*45758.5453); }
float hash( vec3 p ){ return fract(sin(dot(p, vec3(7, 157, 113)))*45758.5453); }
float drawObject(in vec3 p){ p = fract(p)-.5; return dot(p, p); }
float cellTile(in vec3 p){
    vec4 d;
    d.x = drawObject(p - vec3(.81, .62, .53));
    p.xy = vec2(p.y-p.x, p.y + p.x)*.7071;
    d.y = drawObject(p - vec3(.39, .2, .11));
    p.yz = vec2(p.z-p.y, p.z + p.y)*.7071;
    d.z = drawObject(p - vec3(.62, .24, .06));
    p.xz = vec2(p.z-p.x, p.z + p.x)*.7071;
    d.w = drawObject(p - vec3(.2, .82, .64));
    d.xy = min(d.xz, d.yw);
    return min(d.x, d.y)*2.66;
}
vec2 path(in float z){ return vec2(20.*sin(z * .04), 4.*cos(z * .09) + 3.*(sin(z*.025)  - 1.)); }
float surfFunc(in vec3 p){
    float c = cellTile(p/6.);
    return mix(c, cos(c*6.283*2.)*.5 + .5, .125);
}
float smin(float a, float b , float s){
    float h = clamp( 0.5 + 0.5*(b-a)/s, 0. , 1.);
    return mix(b, a, h) - h*(1.0-h)*s;
}
float smax(float a, float b, float s){
    float h = clamp( 0.5 + 0.5*(a-b)/s, 0., 1.);
    return mix(b, a, h) + h*(1.0-h)*s;
}
float map(vec3 p){
    float sf = surfFunc(p);
    float cav = dot(cos(p*3.14159265/8.), sin(p.yzx*3.14159265/8.)) + 2.;
    p.xy -= path(p.z);
    float tun = 1.5 - length(p.xy*vec2(1, .4));
    tun = smax(tun, 1.-cav, 2.) + .75 + (.5-sf);
    float gr = p.y + 7. - cav*.5 + (.5-sf)*.5;
    float rf = p.y - 15.;
    return smax(smin(tun, gr, .1), rf, 1.);
}
float trace(in vec3 ro, in vec3 rd){
    float t = 0., h;
    for(int i=0; i<128; i++){
        h = map(ro+rd*t);
        if(abs(h)<0.002*(t*.25 + 1.) || t>FAR) break;
        t += h*.8;
    }
    return min(t, FAR);
}
vec3 normal(in vec3 p)
{
    vec2 e = vec2(-1., 1.)*0.001;
	return normalize(e.yxx*map(p + e.yxx) + e.xxy*map(p + e.xxy) +
					 e.xyx*map(p + e.xyx) + e.yyy*map(p + e.yyy) );
}
vec3 tex3D( sampler2D t, in vec3 p, in vec3 n ){
    n = max(abs(n) - .2, .001);
    n /= (n.x + n.y + n.z );
	p = (texture2D(t, p.yz)*n.x + texture2D(t, p.zx)*n.y + texture2D(t, p.xy)*n.z).xyz;
    return p*p;
}
vec3 doBumpMap( sampler2D tx, in vec3 p, in vec3 n, float bf){
    const vec2 e = vec2(0.001, 0);
    mat3 m = mat3( tex3D(tx, p - e.xyy, n), tex3D(tx, p - e.yxy, n), tex3D(tx, p - e.yyx, n));
    vec3 g = vec3(0.299, 0.587, 0.114)*m;
    g = (g - dot(tex3D(tx,  p , n), vec3(0.299, 0.587, 0.114)) )/e.x; g -= n*dot(n, g);
    return normalize( n + g*bf );
}
float n3D(in vec3 p){
	const vec3 s = vec3(7, 157, 113);
	vec3 ip = floor(p); p -= ip;
    vec4 h = vec4(0., s.yz, s.y + s.z) + dot(ip, s);
    p = p*p*(3. - 2.*p);
    h = mix(fract(sin(h)*43758.5453), fract(sin(h + s.x)*43758.5453), p.x);
    h.xy = mix(h.xz, h.yw, p.y);
    return mix(h.x, h.y, p.z);
}
float bumpSurf3D( in vec3 p){
    float bmp = cellTile(p/3.)*.8 + cellTile(p)*.2;
    float ns = n3D(p*6. - bmp*6.);
    return mix(bmp, 1. - abs(ns-.333)/.667, .05);
}
vec3 doBumpMap(in vec3 p, in vec3 nor, float bumpfactor){
    const vec2 e = vec2(0.001, 0);
    float ref = bumpSurf3D(p);
    vec3 grad = (vec3(bumpSurf3D(p - e.xyy),
                      bumpSurf3D(p - e.yxy),
                      bumpSurf3D(p - e.yyx) )-ref)/e.x;
    grad -= nor*dot(nor, grad);
    return normalize( nor + grad*bumpfactor );
}
float softShadow(in vec3 ro, in vec3 rd, in float start, in float end, in float k){
    float shade = 1.0;
    const int maxIterationsShad = 10;
    float dist = start;
    float stepDist = end/float(maxIterationsShad);
    for (int i=0; i<maxIterationsShad; i++){
        float h = map(ro + rd*dist);
        shade = min(shade, smoothstep(0., 1., k*h/dist));
        dist += clamp(h, .2, stepDist);
        if (abs(h)<0.001 || dist > end) break;
    }
    return min(max(shade, 0.) + .1, 1.);
}
float calculateAO( in vec3 p, in vec3 n)
{
	float ao = 0.0, l;
	const float nbIte = 6.0;
    const float maxDist = 3.;
    for(float i=1.; i< nbIte+.5; i++ ){
        l = (i*.66 + hash(i)*.34)/nbIte*maxDist;
        ao += (l - map( p + n*l ))/(1.+ l);
    }
    return clamp( 1.-ao/nbIte, 0., 1.);
}
vec3 getSky(){ return vec3(2., 1.4, .7); }
float trig3(in vec3 p){
    p = cos(p*2. + (cos(p.yzx) + 1.)*1.57);
    return dot(p, vec3(0.1666)) + 0.5;
}
float trigNoise3D(in vec3 p){
  const mat3 m3RotTheta = mat3(0.25, -0.866, 0.433, 0.9665, 0.25, -0.2455127, -0.058, 0.433, 0.899519 )*1.5;
	float res = 0.;
  float t = trig3(p*3.14159265);
   p += (t);
  p = m3RotTheta*p;
  res += t;
  t = trig3(p*3.14159265);
   p += (t)*0.7071;
  p = m3RotTheta*p;
  res += t*0.7071;
  t = trig3(p*3.14159265);
	res += t*0.5;
	return res/2.2071;
}
float hash31(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7)))*43758.5453); }
float getMist(in vec3 ro, in vec3 rd, in vec3 lp, in float t){
    float mist = 0.;
    ro += rd*t/3.;
    for (int i = 0; i<3; i++){
        float sDi = length(lp-ro)/FAR;
	    float sAtt = 1./(1. + sDi*0.1 + sDi*sDi*0.01);
        mist += trigNoise3D(ro/2.)*sAtt;
        ro += rd*t/3.;
    }
    return clamp(mist/1.5 + hash31(ro)*0.1-0.05, 0., 1.);
}
void main() {
	vec2 u = uv * 2.0 - 1.0;
	vec3 ro = vec3(0, 0, iGlobalTime*8.);
	vec3 lookAt = ro + vec3(0, 0, .5);
	ro.xy += path(ro.z);
	lookAt.xy += path(lookAt.z);
    float FOV = 3.14159265/2.5;
    vec3 forward = normalize(lookAt - ro);
    vec3 right = normalize(vec3(forward.z, 0, -forward.x ));
    vec3 up = cross(forward, right);
    vec3 rd = normalize(forward + FOV*u.x*right + FOV*u.y*up);
	rd.xy = rot2( path(lookAt.z).x/64. )*rd.xy;
    vec3 lp = vec3(FAR*.5, FAR, FAR) + vec3(0, 0, ro.z);
    float t = trace(ro, rd);
    vec3 sky = getSky();
    vec3 col = sky;
    vec3 sp = ro+t*rd;
    float pathHeight = sp.y-path(sp.z).y;
    if (t < FAR){
        vec3 sn = normal( sp );
        vec3 ld = lp-sp;
        ld /= max(length(ld), 0.001);
        const float tSize = 1./4.;
        sn = doBumpMap(sp, sn, .75/(1. + t/FAR*.25));
        float bf = (pathHeight + 5. < 0.)?  .05: .025;
        sn = doBumpMap(iChannel0, sp*tSize, sn, bf/(1. + t/FAR));
        float shd = softShadow(sp, ld, 0.05, FAR, 8.);
        float ao = calculateAO(sp, sn);
        float dif = max( dot( ld, sn ), 0.0);
        float spe = pow(max( dot( reflect(-ld, sn), -rd ), 0.0 ), 5.);
        float fre = clamp(1.0 + dot(rd, sn), 0.0, 1.0);
		float Schlick = pow( 1. - max(dot(rd, normalize(rd + ld)), 0.), 5.0);
		float fre2 = mix(.2, 1., Schlick);
        float amb = fre*fre2*.7 + .05;
        col = clamp(mix(vec3(1.152, 0.4275,.153), vec3(.225, 0.05985, 0.0153), -sn.y*.5 + pathHeight*.5 + 1.75), vec3(.9, 0.534375, 0.239), vec3(.9, .855, .765));
        col = smoothstep(-.5, 1., tex3D(iChannel0, sp*tSize, sn)*2.)*(col + vec3(.225, .21375, .19125));
        col += smoothstep(0., 1., -pathHeight - 5.5)*fre*.25;
        col += getSky()*fre*fre2;
        col = (col*(dif + .1) + vec3(1)*fre2*spe)*shd*ao + amb*pow(col, vec3(2.));
    }
	float dust = getMist(ro, rd, lp, t)*(1.-clamp((pathHeight - 5.)*.125, 0., 1.));
    sky = getSky()*mix(1., .75, dust);
    col = mix(col, sky, min(t*t*1.5/FAR/FAR, 1.));
    u = uv;
    col = min(col, 1.)*pow( 16.0*u.x*u.y*(1.0-u.x)*(1.0-u.y) , .125);
	  gl_FragColor = vec4(sqrt(clamp(col, 0., 1.)), 1);
}\` }
});

const DesertPassage = ({ time }) =>
  <Node
    shader={shaders.desertPassage}
    uniforms={{
      iGlobalTime: time / 1000,
      iChannel0: shadertoyTex17jpg,
    }}
  />

export const DesertPassageLoop = timeLoop(DesertPassage, { frameRate: 30 });

export default() =>
  <Surface width={400} height={400}>
    <DesertPassageLoop />
  </Surface>
`;
export const demodesert={ Example: demodesert_E, source: demodesert_s, ...demodesert_m };
import demodesertcrt_E from "./demodesertcrt";
import * as demodesertcrt_m from "./demodesertcrt/meta";
const demodesertcrt_s = `
//@flow
import React, { Component, PureComponent } from "react";
import {Shaders, Node, GLSL, Bus, connectSize} from "gl-react";
import { Surface } from "gl-react-dom";
import {DesertPassageLoop} from "../demodesert";
import "./index.css";

const shaders = Shaders.create({
  crt: {
// adapted from http://bit.ly/2eR1iKi
    frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform sampler2D rubyTexture;
uniform vec2 rubyInputSize;
uniform vec2 rubyOutputSize;
uniform vec2 rubyTextureSize;
uniform float distortion;
#define TEX2D(c) pow(texture2D(rubyTexture, (c)), vec4(inputGamma))
#define FIX(c)   max(abs(c), 1e-6);
#define PI 3.141592653589
#define phase 0.0
#define inputGamma 2.2
#define outputGamma 2.5
vec2 radialDistortion(vec2 coord) {
        coord *= rubyTextureSize / rubyInputSize;
        vec2 cc = coord - 0.5;
        float dist = dot(cc, cc) * distortion;
        return (coord + cc * (1.0 + dist) * dist) * rubyInputSize / rubyTextureSize;
}
vec4 scanlineWeights(float distance, vec4 color)
{
        vec4 wid = 2.0 + 2.0 * pow(color, vec4(4.0));
        vec4 weights = vec4(distance * 3.333333);
        return 0.51 * exp(-pow(weights * sqrt(2.0 / wid), wid)) / (0.18 + 0.06 * wid);
}
void main()
{
        vec2 one = 1.0 / rubyTextureSize;
        vec2 xy = radialDistortion(uv.xy);
        vec2 uv_ratio = fract(xy * rubyTextureSize) - vec2(0.5);
        xy = (floor(xy * rubyTextureSize) + vec2(0.5)) / rubyTextureSize;
        vec4 coeffs = PI * vec4(1.0 + uv_ratio.x, uv_ratio.x, 1.0 - uv_ratio.x, 2.0 - uv_ratio.x);
        coeffs = FIX(coeffs);
        coeffs = 2.0 * sin(coeffs) * sin(coeffs / 2.0) / (coeffs * coeffs);
        coeffs /= dot(coeffs, vec4(1.0));
        vec4 col  = clamp(coeffs.x * TEX2D(xy + vec2(-one.x, 0.0))   + coeffs.y * TEX2D(xy)                    + coeffs.z * TEX2D(xy + vec2(one.x, 0.0)) + coeffs.w * TEX2D(xy + vec2(2.0 * one.x, 0.0)),   0.0, 1.0);
        vec4 col2 = clamp(coeffs.x * TEX2D(xy + vec2(-one.x, one.y)) + coeffs.y * TEX2D(xy + vec2(0.0, one.y)) + coeffs.z * TEX2D(xy + one)              + coeffs.w * TEX2D(xy + vec2(2.0 * one.x, one.y)), 0.0, 1.0);
        vec4 weights  = scanlineWeights(abs(uv_ratio.y) , col);
        vec4 weights2 = scanlineWeights(1.0 - uv_ratio.y, col2);
        vec3 mul_res  = (col * weights + col2 * weights2).xyz;
        float mod_factor = uv.x * rubyOutputSize.x * rubyTextureSize.x / rubyInputSize.x;
        vec3 dotMaskWeights = mix(
                vec3(1.05, 0.75, 1.05),
                vec3(0.75, 1.05, 0.75),
                floor(mod(mod_factor, 2.0))
            );
        mul_res *= dotMaskWeights;
        mul_res = pow(mul_res, vec3(1.0 / (2.0 * inputGamma - outputGamma)));
        gl_FragColor = vec4(mul_res, 1.0);
}\` },
    copy: {
      frag: GLSL\`
  precision highp float;
  varying vec2 uv;
  uniform sampler2D t;
  void main(){
    gl_FragColor=texture2D(t,uv);
  }\`,
    }
});

class CRT extends Component {
  props: {
    children?: any,
    distortion: number,
    inSize: [number, number],
    outSize: [number, number],
    texSize: [number, number],
  };
  render() {
    const { children, inSize, outSize, texSize, distortion } = this.props;
    return <Node
      shader={shaders.crt}
      uniforms={{
        rubyTexture: children,
        rubyInputSize: inSize,
        rubyOutputSize: outSize,
        rubyTextureSize: texSize,
        distortion,
      }}
    />;
  }
}

const Desert = connectSize(DesertPassageLoop);

class ShowCaptured extends PureComponent {
  render() {
    const {t} = this.props;
    return <Surface width={200} height={200}>
      <Node shader={shaders.copy} uniforms={{ t }} />
    </Surface>;
  }
}

export default class Example extends Component {
  state = {
    surfacePixels: null,
    desertPixels: null,
  };

  onCapture = () =>
    this.setState({
      surfacePixels: this.refs.surface.capture(),
      desertPixels: this.refs.desert.capture(),
    });

  render() {
    const { distortion } = this.props;
    const { surfacePixels, desertPixels } = this.state;
    return (
<div>
  <Surface ref="surface"
    width={400}
    height={400}
    webglContextAttributes={{ preserveDrawingBuffer: true }}>

    <Bus ref="desert">{/* we use a Bus to have a ref for capture */}
      <Desert width={128} height={128} />
    </Bus>

    <CRT
      distortion={distortion}
      texSize={[ 128, 128 ]}
      inSize={[ 128, 128 ]}
      outSize={[ 400, 400 ]}>
      {() => this.refs.desert}
    </CRT>

  </Surface>

  <div className="buttons">
    <button onClick={this.onCapture}>capture</button>
  </div>
  <div className="snaps">
    <ShowCaptured t={surfacePixels} />
    <ShowCaptured t={desertPixels} />
  </div>
</div>
    );
  }

  static defaultProps = {
    distortion: 0.2
  };
};
`;
export const demodesertcrt={ Example: demodesertcrt_E, source: demodesertcrt_s, ...demodesertcrt_m };
import behindasteroids_E from "./behindasteroids";
import * as behindasteroids_m from "./behindasteroids/meta";
const behindasteroids_s = `
//@flow
import React, { Component } from "react";
import { Shaders, Node, GLSL, Bus, Backbuffer } from "gl-react";
import { Surface } from "gl-react-dom";
import gameBuild from "./build";

/**
 * This example reproduce the after effects made in a js13k game:
 * https://github.com/gre/behind-asteroids
 * see also https://github.com/gre/behind-asteroids/blob/master/src/effects.js
 */

const shaders = Shaders.create({
  blur1d: {
    frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
uniform vec2 dim;
uniform vec2 dir;
void main() {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.3846153846) * dir;
  vec2 off2 = vec2(3.2307692308) * dir;
  color += texture2D(t, uv) * 0.2270270270;
  color += texture2D(t, uv + (off1 / dim)) * 0.3162162162;
  color += texture2D(t, uv - (off1 / dim)) * 0.3162162162;
  color += texture2D(t, uv + (off2 / dim)) * 0.0702702703;
  color += texture2D(t, uv - (off2 / dim)) * 0.0702702703;
  gl_FragColor = color;
}
    \`
  },
  game: {
    frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform sampler2D G;
uniform sampler2D R;
uniform sampler2D B;
uniform sampler2D L;
uniform sampler2D E;
uniform float s;
uniform float F;
uniform vec2 k;
float squircleDist (vec2 a, vec2 b) {
  float p = 10.0;
  vec2 c = a-b;
  return pow(abs(pow(abs(c.x), p)+pow(abs(c.y), p)), 1.0/p);
}
void main() {
  vec2 UV = uv + k;
  vec2 pos = (UV/0.98)-0.01;
  float d = squircleDist(UV, vec2(0.5));
  float dd = smoothstep(0.45, 0.51, d);
  pos = mix(pos, vec2(0.5), 0.2 * (0.6 - d) - 0.02 * d);
  vec3 gc = texture2D(G, pos).rgb;
  gl_FragColor =
  step(0.0, UV.x) *
  step(UV.x, 1.0) *
  step(0.0, UV.y) *
  step(UV.y, 1.0) *
  vec4((
    vec3(0.03 + 0.1 * F, 0.04, 0.05) +
    mix(vec3(0.05, 0.1, 0.15) - gc, 2.0 * gc, s) +
    s * (
      texture2D(L, pos).rgb +
      vec3(0.3 + F, 0.6, 1.0) * (
        texture2D(R, pos).rgb +
        3.0 * texture2D(B, pos).rgb
      ) +
      0.5 * texture2D(E, pos).rgb
    )
  )
  * mix(1.0, smoothstep(1.0, 0.0, dd), 0.6), 1.0);
}
    \`
  },
  glare: {
    frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
void main() {
  gl_FragColor = vec4(step(0.9, texture2D(t, uv).r));
}
    \`
  },
  laser: {
    frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
void main() {
  vec3 c = texture2D(t, uv).rgb;
  vec2 off = 0.003 * vec2(
    cos(47.0 * uv.y),
    sin(67.0 * uv.x)
  );
  gl_FragColor = vec4(
    c.r + c.g + c.b + texture2D(t, uv+off).b
  );
}

    \`
  },
  persistence: {
    frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
uniform sampler2D r;
void main() {
  vec3 b = texture2D(r, uv).rgb;
  gl_FragColor = vec4(
    b * (0.82 - 0.3 * b.r * b.r) +
    texture2D(t, uv).rgb,
    1.0);
}
\`

  },
  player: {
    frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform float pt;
uniform float pl;
uniform float S;
uniform float ex;
uniform float J;
uniform float P;
float disc (vec2 c, vec2 r) {
  return step(length((uv - c) / r), 1.0);
}
float squircle (vec2 c, vec2 r, float p) {
  vec2 v = (uv - c) / r;
  return step(pow(abs(v.x), p) + pow(abs(v.y), p), 1.0);
}
vec3 env () {
  return 0.1 +
  0.3 * vec3(1.0, 0.9, 0.7) *
    smoothstep(0.4, 0.1, distance(uv, vec2(0.2, 1.2))) +
  0.4 * vec3(0.8, 0.6, 1.0) *
    smoothstep(0.5, 0.2, distance(uv, vec2(1.3, 0.7)));
}
vec4 player (float p, float dx) {
  vec4 c = vec4(0.0);
  vec2 e = vec2(
    min(ex, 1.0),
    mix(min(ex, 1.0), min(ex-1.0, 1.0), 0.5));
  vec4 skin = 0.2 + 0.4 * pow(abs(cos(4.*p+S)), 2.0) *
    vec4(1.0, 0.7, 0.3, 1.0);
  vec4 hair = vec4(0.5, 0.3, 0.3, 1.0);
  vec4 sweater = vec4(
    0.3 * (1.0 + cos(3.*p + 6.*S)),
    0.2 * (1.0 + cos(7.*p + 7.*S)),
    0.1+0.2 * (1.0 + sin(7.*p + 8.*S)),
    1.0);
  float feminity = step(sin(9.0*p+S), 0.0);
  float hairSize = 0.02 + 0.02 * feminity * cos(p+S);
  float walk = step(dx, -0.01) + step(0.01, dx);
  float play = (1.0 - walk) * step(0.0, pt);
  vec2 pos = vec2(0.5) +
  J * vec2(0.0, 0.2) +
  walk * vec2(
    0.03 * cos(4.0*pt + sin(pt)),
    0.05 * abs(sin(3.0*pt))) +
  e * play * (1.0 - P) * vec2(
    0.05 * cos(pt * (1.0 + 0.1 * sin(pt))),
    0.05 * abs(sin(pt)));
  vec2 pos2 = mix(pos, vec2(0.5), 0.5);
  pos.x += dx;
  pos2.x += dx;
  c += skin * disc(pos, vec2(0.06, 0.1));
  c *= 1.0 - (0.5 + 0.5 * feminity) *
    disc(pos - vec2(0.0, 0.04), vec2(0.03, 0.01));
  c *= 1.0 - disc(pos + vec2(0.03, 0.03), vec2(0.02, 0.01));
  c *= 1.0 - disc(pos + vec2(-0.03, 0.03), vec2(0.02, 0.01));
  c *= 1.0 - 0.6 * disc(pos, vec2(0.01, 0.02));
  c += hair * disc(pos + vec2(0.0, hairSize), vec2(0.07, 0.1 + hairSize));
  c += play * (hair + skin) * disc(pos2 - vec2(
    -0.2 + 0.01 * cos(5.0*pt),
    0.45 - 0.1 * e.y * step(0.0, pt) * P * pow(abs(sin(8.0 * pt *
      (1.0 + 0.2 * cos(pt)))), 4.0)
  ), vec2(0.055, 0.05));
  c += play * (hair + skin) * disc(pos2 - vec2(
    0.2 + 0.01 * cos(5.0*pt),
    0.45 - 0.1 * e.x * step(2.0, pt) * P * pow(abs(cos(7.0 * pt)), 4.0)
  ), vec2(0.055, 0.05));
  c += step(c.a, 0.0) * (hair + skin) *
    squircle(pos - vec2(0.0, 0.10 + 0.02 * feminity),
      vec2(0.05 - 0.01 * feminity, 0.03), 4.0);
  vec2 sr = vec2(
    0.16 + 0.04 * sin(9.*p),
    0.27 + 0.02 * cos(9.*p));
  c += step(c.r+c.g+c.b, 0.0) * sweater * step(1.0,
  squircle(pos - vec2(0.0, 0.35), sr * (1.0 - 0.1 * feminity), 4.0) +
  disc(pos - vec2(0.0, 0.35), sr));
  return c;
}
void main() {
  float light = 0.6 + 0.4 * smoothstep(2.0, 0.0, distance(pt, -2.0));
  vec4 c = vec4(0.0);
  c += (1.0 - smoothstep(-0.0, -5.0, pt)) *
    player(pl+step(pt, 0.0), -0.6 * smoothstep(-1., -5., pt));
  c += step (1.0, pl) *
    player(pl+step(pt, 0.0)-1.0, 2.0 *smoothstep(-4., -1., pt));
  c *= 1.0 - 1.3 * distance(uv, vec2(0.5));
  gl_FragColor = vec4(light * mix(env(), c.rgb, clamp(c.a, 0.0, 1.0)), 1.0);
}
\`
  }
});

const Blur1D =
  ({ dim, dir, children: t }) =>
  <Node shader={shaders.blur1d} uniforms={{ dim, dir, t }} />;

export default class Example extends Component {
  render () {
    const {showCanvas} = this.props;
    const {pt,pl,ex,J,P,s,F,k,S,W,H} =
    // HACK to just render the game
    this._ ? this._.getWebGLParams() :
({ pt: 0, pl: 0, ex: 0, J: 0, P: 0, s: 0, F: 0, k: [0,0], W: 2, H: 2, S: 0 });
    const dim = [ W, H ];

    return (
    <div style={{ background: "black" }} ref="container">

      <Surface width={W} height={H} pixelRatio={1}>

        <Bus ref="laser">
          <Node
            shader={shaders.laser}
            uniforms={{ t: () => this.refs.gameCanvas }}
          />
        </Bus>

        <Bus ref="player">
          <Blur1D dim={dim} dir={[ 0, 2 ]}>
            <Blur1D dim={dim} dir={[ 6, 0 ]}>
              <Blur1D dim={dim} dir={[ 2, 2 ]}>
                <Blur1D dim={dim} dir={[ -2, 2 ]}>
                  <Node
                    shader={shaders.player}
                    uniforms={{ pt, pl, ex, J, P, S }}
                  />
                </Blur1D>
              </Blur1D>
            </Blur1D>
          </Blur1D>
        </Bus>

        <Bus ref="glare">
          <Blur1D dim={dim} dir={[ 2, -4 ]}>
            <Node
              shader={shaders.glare}
              uniforms={{ t: () => this.refs.laser }}
            />
          </Blur1D>
        </Bus>

        <Bus ref="glareCursor">
          <Blur1D dim={dim} dir={[ 4, -8 ]}>
            {() => this.refs.glare}
          </Blur1D>
        </Bus>

        <Bus ref="glareBlurred">
          <Blur1D dim={dim} dir={[ 0, 1 ]}>
            <Blur1D dim={dim} dir={[ 1, 0 ]}>
              <Blur1D dim={dim} dir={[ -0.5, 0.5 ]}>
                <Blur1D dim={dim} dir={[ 0.5, 0.5 ]}>
                  {() => this.refs.laser
                  //FIXME this should be glare instead.
                  //but i think there is a bug in gl-react!
                  }
                </Blur1D>
              </Blur1D>
            </Blur1D>
          </Blur1D>
        </Bus>

        <Bus ref="persistence">
          <Node
            shader={shaders.persistence}
            backbuffering
            uniforms={{
              t: this.refs.glareBlurred,
              r: Backbuffer
            }}
          />
        </Bus>

        <Node
          shader={shaders.game}
          uniforms={{
            G: () => this.refs.laser,
            R: () => this.refs.persistence,
            B: () => this.refs.glareBlurred,
            L: () => this.refs.glareCursor,
            E: () => this.refs.player,
            s,
            F,
            k
          }} />
      </Surface>

      <canvas id="c" ref="gameCanvas" hidden={!showCanvas} />

      <div style={{ textAlign: "center", padding: 20 }}>
        <button onClick={this.sendAsteroid}>
          SEND ASTEROID!
        </button>
      </div>
    </div>
    );
  }

  _: any;
  componentDidMount () {
    this._ = gameBuild(
      this.refs.container,
      this.refs.gameCanvas,
      () => this.forceUpdate()
    );
  }
  componentWillUnmount() {
    this._.dispose();
  }

  sendAsteroid = () => window._behindAsteroids_send();

  static defaultProps = {
    showCanvas: false,
  };
}
`;
export const behindasteroids={ Example: behindasteroids_E, source: behindasteroids_s, ...behindasteroids_m };
import ibex_E from "./ibex";
import * as ibex_m from "./ibex/meta";
const ibex_s = `
/**
 * This celullar automaton is extracted from a game I wrote in 2014 for JS13K:
 * https://github.com/gre/ibex
 *
 * Technical article: http://greweb.me/2014/09/ibex-cellular-automata/
 */

//@flow
import React, { Component } from "react";
import { Shaders, Node, GLSL, Backbuffer } from "gl-react";
import { Surface } from "gl-react-dom";
import ndarray from "ndarray";
import timeLoop from "../../HOC/timeLoop";

const shaders = Shaders.create({
  IBEXRender: {
    frag: GLSL\`
precision highp float;
varying vec2 uv;
uniform vec2 size;
uniform sampler2D state;
uniform vec3 CL[9];

float rand(vec2 co){
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
vec3 colorFor (int e) {
  if(e==0) return CL[0];
  if(e==1) return CL[1];
  if(e==2) return CL[2];
  if(e==3) return CL[3];
  if(e==4) return CL[4];
  if(e==5) return CL[5];
  if(e==6) return CL[6];
  if(e==7) return CL[7];
  return CL[8];
}
int getState (vec2 pos) {
  vec2 uv = (floor(pos) + 0.5) / size;
  bool outOfBound = uv.x<0.0||uv.x>1.0||uv.y<0.0||uv.y>1.0;
  if (outOfBound) return pos.y < 0.0 ? 1 : 0;
  float cel = texture2D(state, uv).r;
  return int(floor(.5 + 9. * cel));
}
vec3 stateColorPass (int e, vec2 pos) {
  return (
    mix(1.0, rand(pos), 0.05*float(e==1) + 0.2*float(e==8)) +
    float(e==8) * (
      step(0.97, rand(pos)) * vec3(3.0, 0.0, 0.0) +
      step(rand(pos), 0.02) * vec3(1.5, -0.5, 0.5)
    )
  ) * colorFor(e);
}
void main(){
  vec2 statePos = uv * size;
  vec2 statePosFloor = floor(statePos);
  vec3 stateColor = stateColorPass(getState(statePosFloor), statePosFloor);
  vec3 c = stateColor;
  vec2 pixelPos = fract(statePos);
  vec3 pixelColor = -vec3(0.03) * (pixelPos.x - pixelPos.y);
  c += pixelColor;
  gl_FragColor = vec4(c, 1.0);
}
\`
  },
  IBEXLogic: {
    frag: GLSL\`
#define RAND (S_=vec2(rand(S_), rand(S_+9.))).x
#define AnyADJ(e) (NW==e||SE==e||NE==e||SW==e||NN==e||SS==e||EE==e||WW==e)
precision highp float;
int A  = 0;
int E  = 1;
int F  = 2;
int W  = 3;
int V  = 4;
int S  = 5;
int Al = 6;
int Ar = 7;
int G  = 8;
varying vec2 uv;
uniform vec2 SZ;
uniform float SD;
uniform float TI;
uniform float TS;
uniform float ST;
uniform sampler2D state;
uniform bool RU;
uniform bool draw;
uniform ivec2 DP;
uniform float DR;
uniform int DO;
uniform float forestGrowFactor;
int get (int x_, int y_) {
  vec2 u = (SZ * uv + vec2(x_, y_)) / SZ;
  return (u.x < 0.0 || u.x >= 1.0 || u.y < 0.0 || u.y >= 1.0) ? 0 :
    int(floor(.5 + 9. * texture2D(state, u).r));
}
bool between (float f, float a, float b) {
  return a <= f && f <= b;
}
float rand(vec2 co){
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
float grassDistrib (vec2 p) {
  return mix(
  rand(vec2(p.x)),
  0.5*(1.0+(cos(sin(p.y*0.01 + p.x * 0.05) +
  (1.0 + 0.3*sin(p.x*0.01)) * p.y * 0.08))),
  0.6
  );
}
bool hellTriggerPosition (vec2 p) {
  if (TS==0.0) return false;
  float hellTickStart = 800.0;
  float hellTickInterv = 70.0;
  float hellSize = 5.0;
  float dt = TI - TS - hellTickStart;
  float x = floor(dt / hellTickInterv);
  float y = (dt - x * hellTickInterv);
  return distance(vec2(2.0 * (hellSize * x - ST), hellSize * y), p) <= hellSize;
}
void main () {
  vec2 p = uv * SZ;
  vec2 S_ = p + 0.001 * TI;
  int NW = get(-1, 1);
  int NN = get( 0, 1);
  int NE = get( 1, 1);
  int WW = get(-1, 0);
  int CC = get( 0, 0);
  int EE = get( 1, 0);
  int SW = get(-1,-1);
  int SS = get( 0,-1);
  int SE = get( 1,-1);
  bool prevIsSolid = CC==E||CC==G||CC==V||CC==S;
  int r = A;
  int grassMaxHeight = int(20.0 * pow(grassDistrib(p), 1.3));
  float rainRelativeTime = mod(TI, 300.0);
  float volcRelativeTime = mod(TI, 25.0);
  if (
    -0.05 * float(NW==W) + -0.40 * float(NN==W) + -0.05 * float(NE==W) +
    -0.50 * float(WW==W) + -0.50 * float(CC==W) + -0.50 * float(EE==W) +
     0.35 * float(SW==F) +  0.90 * float(SS==F) +  0.35 * float(SE==F)
   >= 0.9 - 0.6 * RAND
   ||
   CC == F && RAND < 0.9 && AnyADJ(G)
  ) {
    r = F;
  }
  if (
    between(
      0.3 * float(NW==W) +  0.9 * float(NN==W) +  0.3 * float(NE==W) +
      0.1 * float(WW==W) + -0.3 * float(CC==F) +  0.1 * float(EE==W) +
                           -0.3 * float(SS==F)
      ,
      0.9 - 0.6 * RAND,
      1.4 + 0.3 * RAND
    )
    ||
    !prevIsSolid &&
    RAND < 0.98 &&
    ( (WW==W||NW==W) && SW==E || (EE==W||NE==W) && SE==E )
    ||
    !prevIsSolid &&
    p.y >= SZ.y-1.0 &&
    rainRelativeTime < 100.0 &&
    between(
      p.x -
      (rand(vec2(SD*0.7 + TI - rainRelativeTime)) * SZ.x)
      ,
      0.0,
      100.0 * rand(vec2(SD + TI - rainRelativeTime))
    )
    ||
    !prevIsSolid && (
      0.9 * float(NW==S) +  1.0 * float(NN==S) +  0.9 * float(NE==S) +
      0.7 * float(WW==S) +                        0.7 * float(EE==S)
      >= 1.0 - 0.3 * RAND
    )
  ) {
    r = W;
  }
  if (CC == E) {
    if (!(WW==A && EE==A)) r = E;
    if (
      RAND < 0.3 && (
        1.0 * float(NW==W) + 1.2 * float(NN==W) + 1.0 * float(NE==W) +
        0.5 * float(WW==W) +                      0.5 * float(EE==W) +
        0.3 * float(SW==W) + 0.2 * float(SS==W) + 0.3 * float(SE==W)
        >= 3.0 - 2.5 * RAND
      )
      ||
      RAND < 0.01 && ( WW==S || NN==S || EE==S )
    ) {
      r = S;
    }
    if (
    RAND < 0.01 + 0.02 * smoothstep(500.0, 5000.0, ST + p.x) &&
    ( int(WW==V) + int(SS==V) + int(EE==V) + int(SE==V) + int(SW==V) > 1 )
    ) {
      r = V;
    }
  }
  if (grassMaxHeight > 0) {
    if (CC == G) {
      r = G;
      if (
      CC == G &&
      RAND < 0.9 && (
        AnyADJ(F) ||
        AnyADJ(V)
      )) {
        r = F;
      }
    }
    else if (!prevIsSolid && (AnyADJ(E) || AnyADJ(G) || AnyADJ(S))) {
      if (RAND < 0.03 * forestGrowFactor &&
        get(0, -grassMaxHeight) != G && (
          SS==G && RAND < 0.07 ||
          SS==E && RAND < 0.02 ||
          AnyADJ(W) ||
          AnyADJ(S)
        )
      ) {
        r = G;
      }
    }
  }
  if ((!prevIsSolid || CC==F) && SS==V) {
    r = F;
  }
  if (CC == V) {
    r = V;
    if (
      NW==W || NN==W || NE==W || EE==W || WW==W
    ) {
      r = RAND < 0.8 ? S : E;
    }
    if (
      RAND<0.005 &&
      ( int(SW==F||SW==V) + int(SS==F||SS==V) + int(SE==F||SE==V) < 2 )
    ) {
      r = E;
    }
    if (
      int(NW==S) + int(SE==S) + int(NE==S) + int(SW==S) +
      int(NN==S) + int(SS==S) + int(EE==S) + int(WW==S)
      > 1
    ) {
      r = RAND < 0.2 ? V : (RAND < 0.8 ? S : E);
    }
  }
  if (prevIsSolid &&
    p.y <= 2.0 &&
    volcRelativeTime <= 1.0 &&
    RAND < 0.3 &&
    between(
      p.x -
      rand(vec2(SD*0.01 + TI - volcRelativeTime)) * SZ.x
      ,
      0.0,
      10.0 * rand(vec2(SD*0.07 + TI - volcRelativeTime))
    )
  ) {
    r = V;
  }
  if (CC == S) {
    r = S;
    if (
      RAND<0.06 &&
      ( int(NW==W||NW==S) + int(NN==W||NN==S) + int(NE==W||NE==S) < 1 )

      ||
      ( EE==F || WW==F || SS==F || SW==F || SE==F )
    ) {
      r = E;
    }
    if (AnyADJ(V)) {
      r = RAND < 0.15 ? V : (RAND < 0.6 ? S : E);
    }
  }
  if (r == A) {
    if (RAND < 0.00001) r = Al;
    if (RAND < 0.00001) r = Ar;
  }

  int wind = r==Al ? Al : r == Ar ? Ar : 0;
  float f =
(-0.1+0.05*(RAND-0.5)) * float(NW==Ar) + 0.12                  * float(NE==Al) +
-0.65                  * float(WW==Ar) + 0.65                  * float(EE==Al) +
-0.1                   * float(SW==Ar) + (0.2+0.05*(RAND-0.5)) * float(SE==Al) ;

  if (between(f, 0.4 * RAND, 0.95)) {
    wind = Al;
  }
  else if (between(f, -0.95, -0.4 * RAND)) {
    wind = Ar;
  }
  if (wind != 0) {
    if (r == A) {
      r = wind;
    }
    else if(r == F) {
      if (RAND < 0.4) r = wind;
    }
    else if (r == W) {
      if (RAND < 0.1) r = wind;
    }
  }
  if (draw) {
    vec2 pos = floor(p);
    if (distance(pos, vec2(DP)) <= DR) {
      if (DO == W) {
        if (prevIsSolid && CC!=G) {
          r = S;
        }
        else if (!prevIsSolid && mod(pos.x + pos.y, 2.0)==0.0) {
          r = W;
        }
      }
      else if (DO == F) {
        r = prevIsSolid ? V : F;
      }
      else {
        r = DO;
      }
    }
  }
  if (hellTriggerPosition(p)) {
    r = prevIsSolid ? V : F;
  }
  if (!RU) {
    if (r == F || r == W|| r == G) r = A;
    if (r == V || r == S) r = E;
  }
  gl_FragColor = vec4(float(r) / 9.0,  0.0, 0.0, 1.0);
}\`
  }
});

class IBEXLogic extends Component {
  state = {
    seed: Math.random(),
  };
  shouldComponentUpdate({ tick }) {
    return tick !== this.props.tick;
  }
  render() {
    const {
      size,
      tick,
      initialState,
      forestGrowFactor,
      waterFactor,
      fireFactor,
    } = this.props;
    const { seed } = this.state;
    let draw=false, drawPosition=[0,0], drawRadius=0, drawElement=0;

    let w = Math.random() < waterFactor, f = Math.random() < fireFactor;
    if (w && f) {
      if (Math.random() * waterFactor - Math.random() * fireFactor > 0) {
        f = false;
      }
      else {
        w = false;
      }
    }
    if (w) {
      draw = true;
      drawPosition=[
        size[0]*Math.random(),
        size[1]*(0.8 + 0.2 * Math.random()),
      ];
      drawRadius = 4;
      drawElement = 3;
      console.log(drawElement, drawPosition, drawPosition);
    }
    else if (f) {
      draw = true;
      drawPosition=[
        size[0]*Math.random(),
        0,
      ];
      drawRadius = 4;
      drawElement = 2;
      console.log(drawElement, drawPosition, drawPosition);
    }

    return <Node
      shader={shaders.IBEXLogic}
      sync
      backbuffering
      uniformsOptions={{ state: { interpolation: "nearest" } }}
      uniforms={{
        state: tick===0 ? initialState : Backbuffer,
        SZ: size,
        SD: seed,
        TI: tick,
        TS: 0, // tick start
        RU: true, // logic running
        ST: true, // render started
        draw,
        DP: drawPosition, // draw position
        DR: drawRadius, // draw radius
        DO: drawElement, // the element that is being drawn
        forestGrowFactor,
      }}
    />;
  }
}

var colors = [
  [0.11, 0.16, 0.23], // 0: air
  [0.74, 0.66, 0.51], // 1: earth
  [0.84, 0.17, 0.08], // 2: fire
  [0.40, 0.75, 0.90], // 3: water
  [0.60, 0.00, 0.00], // 4: volcano (fire spawner)
  [0.30, 0.60, 0.70], // 5: source (water spawner)
  [0.15, 0.20, 0.27],  // 6: wind left
  [0.07, 0.12, 0.19],  // 7: wind right
  [0.20, 0.60, 0.20]   // 8: grass (forest)
];

const IBEXRender = ({ size, children: state }) =>
  <Node
    shader={shaders.IBEXRender}
    uniformsOptions={{ state: { interpolation: "nearest" } }}
    uniforms={{
      state,
      size,
      CL: colors,
    }}
  />;

const Game = timeLoop(class extends Component {
  state = {
    tick: 0,
    lastTickTime: this.props.time,
  };

  componentWillReceiveProps({ time, speed }) {
    this.setState(({ tick, lastTickTime }) => {
      const delta = 1000/speed;
      if (time-lastTickTime > delta) {
        return {
          tick: tick + 1,
          lastTickTime: lastTickTime + delta,
        };
      }
    });
  }

  render() {
    const {
      size,
      initialState,
      forestGrowFactor,
      waterFactor,
      fireFactor
    } = this.props;
    const {
      tick,
    } = this.state;
    return <IBEXRender size={size}>
      <IBEXLogic
        initialState={initialState}
        size={size}
        tick={tick}
        forestGrowFactor={forestGrowFactor}
        waterFactor={waterFactor}
        fireFactor={fireFactor}
      />
    </IBEXRender>;
  }
});

// This should be implemented in a shader (it's a cellular automaton too)
// but it's how it was done in the game
function generate (startX: number, worldSize: [number,number]) {
  var worldPixelRawBuf = new Uint8Array(worldSize[0] * worldSize[1] * 4);
  var worldPixelBuf = new Uint8Array(worldSize[0] * worldSize[1]);
  var waterInGeneration = 0;
  var volcanoInGeneration = 0;
  var w = worldSize[0], h = worldSize[1];
  function step (a, b, x) {
    return Math.max(0, Math.min((x-a) / (b-a), 1));
  }
  function affectColor (buf, i, c) {
    buf[i] = ~~(256 * c / 9);
    buf[i+3] = 1;
  }
  function get (b, x, y) {
    if (x >= 0 && x < w && y >= 0 && y < h) {
      return b[x + y * w];
    }
    return y > 50 ? 1 : 0;
  }
  function set (b, x, y, e) {
    if (x >= 0 && x < w && y >= 0 && y < h) {
      b[x + y * w] = e;
    }
  }
  var K = 26;
  var x, y, i, k, e;
  for (x = startX; x < worldSize[0]; ++x) {
    for (y = 0; y < worldSize[1]; ++y) {
      e = +(Math.random() >
      0.22
      + 0.3 * (step(0, 20, y)
      + step(worldSize[1]-20, worldSize[1] - 2, y)));
      set(worldPixelBuf, x, y, e);
    }
  }
  var swp = new Uint8Array(worldPixelBuf);
  var cur = worldPixelBuf;
  for (k = 0; k < K; ++k) {
    for (x = startX; x < worldSize[0]; ++x) {
      for (y = 0; y < worldSize[1]; ++y) {
        var me = get(cur, x, y);
        var sum =
          0.1 * me +
          (0.9 + 0.1 * Math.random()) * (get(cur, x-1, y-1)?1:0) +
          (0.9 + 0.1 * Math.random()) * (get(cur, x, y-1)?1:0) +
          (0.9 + 0.1 * Math.random()) * (get(cur, x+1, y-1)?1:0) +
          (1.4 + 0.2 * Math.random()) * (get(cur, x-1, y)?1:0) +
          (1.1 + 0.2 * Math.random()) * (get(cur, x+1, y)?1:0) +
          (1.6 - 0.1 * Math.random()) * (get(cur, x-1, y+1)?1:0) +
          (1.2 - 0.2 * Math.random()) * (get(cur, x, y+1)?1:0) +
          (1.0 - 0.1 * Math.random()) * (get(cur, x+1, y+1?1:0));
        let e = +(sum <= 6 + (Math.random()-0.5) * (1-k/K));
        if (e && sum >= 6 - Math.random() * waterInGeneration + 4 * step(110, 0, y)) e = 5;
        if (e && sum >= 6 - Math.random() * volcanoInGeneration + 6 * step(20, 60, y)) e = 4;
        set(swp, x, y, e);
      }
    }
    var tmp = swp;
    swp = cur;
    cur = tmp;
  }
  if (swp === cur) worldPixelBuf = swp;
  for (i = 0; i < worldPixelBuf.length; ++i) {
    affectColor(worldPixelRawBuf, 4 * i, worldPixelBuf[i]);
  }
  return ndarray(worldPixelRawBuf, [ worldSize[0], worldSize[1], 4]).transpose(1, 0, 2).step(1, -1, 1);
}

const size = [200,200];

export default class Example extends Component {
  state = {
    initialState: generate(0, size),
  };
  render() {
    const { forestGrowFactor, fireFactor, waterFactor, speed } = this.props;
    const { initialState } = this.state;
    return (
      <Surface width={400} height={400}>
        <Game
          speed={speed}
          size={size}
          initialState={initialState}
          forestGrowFactor={forestGrowFactor}
          fireFactor={fireFactor}
          waterFactor={waterFactor}
        />
      </Surface>
    );
  }

  static defaultProps = {
    speed: 60,
    forestGrowFactor: 1,
    fireFactor: 0,
    waterFactor: 0,
  };
}


/**
* Game Rule Interactions.
*
* Each interaction use various probability. Some are very rare, some frequent.
/!\\ here air means wind /!\\ it is different of empty, the empty space is
* called "Nothing" aka N)
*
* Primary elements: Water, Fire, Earth, Air
* =======
* Water + Nothing => fall / slide
* Fire + Nothing => grow
* Air + Nothing => move (directional wind)
* Water + Air => Water is deviated (wind)
* Fire + Air => Fire decrease
* Earth + Water => rarely creates Water Source (water infiltration)
* Earth + Fire => rarely creates Volcano (fire melt ground into lava)
*
* Secondary elements: Source, Volcano
* =========
* Source + Nothing => creates Water (on bottom).
* Volcano + Nothing => creates Fire (on top)
* Volcano + Source => IF source on top of volcano: sometimes creates Ground.
* OTHERWISE: sometimes creates volcano.
* Volcano + Water => rarely creates Source.
* Earth + Volcano => rarely Volcano expand / grow up in the Earth.
* Earth + Source => rarely Source expand / infiltrate in the Earth.
* Source + Fire => Source die.
*
* Cases where nothing happens:
* Water + Fire
* Earth + Nothing
* Volcano + Fire
* Volcano + Air
* Earth + Air
* Source + Air
* Source + Water
*/
`;
export const ibex={ Example: ibex_E, source: ibex_s, ...ibex_m };
