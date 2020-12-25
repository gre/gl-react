//@flow
import React, { PureComponent, Component } from "react";
import { Shaders, Node, GLSL, Bus } from "gl-react";
import { Surface } from "../../gl-react-implementation";
import marioPNG from "../../images/pixeleditor-mario.png";
import respondToTouchPosition from "../../HOC/respondToTouchPosition";

type Vec2 = [number, number];

const shaders = Shaders.create({
  paint: {
    frag: GLSL`
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
}`,
  },
  initTexture: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
void main(){
  gl_FragColor=texture2D(t,uv);
}`,
  },
  pixelEditor: {
    frag: GLSL`
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
}`,
  },
});

class Paint extends PureComponent {
  state = {
    initialized: false,
  };
  onDraw = () => {
    if (!this.state.initialized) {
      this.setState({ initialized: true });
    }
  };
  render() {
    const { initialTexture, onPaintNodeRef, ...rest } = this.props;
    const { initialized } = this.state;
    return (
      <Node
        ref={onPaintNodeRef}
        sync={!initialized}
        shader={!initialized ? shaders.initTexture : shaders.paint}
        width={rest.size[0]}
        height={rest.size[1]}
        uniforms={!initialized ? { t: initialTexture } : rest}
        clear={null}
        onDraw={this.onDraw}
      />
    );
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
          t: { interpolation: "nearest" },
        }}
        uniforms={{
          size,
          gridBorder,
          brushRadius,
          mouse,
          color,
        }}
      >
        <Bus uniform="t">
          <Paint {...rest} />
        </Bus>
      </Node>
    );
  }
}

const size = [16, 16];
const gridBorder = [1 / 8, 1 / 8];
const tools = {
  "brush-1": { brushRadius: 0.55 / 16 },
  "brush-2": { brushRadius: 1.1 / 16 },
  "brush-4": { brushRadius: 2.2 / 16 },
  rubber: { brushRadius: 4 / 16, forceColor: [0, 0, 0, 0] },
  "color-picker": { colorPick: true },
};

const Example = respondToTouchPosition(
  class extends Component {
    render() {
      const { color, toolKey, touching, touchPosition, width } = this.props;
      const tool = tools[toolKey];
      return (
        <Surface
          style={{ width, height: width }}
          preload={[marioPNG]}
          webglContextAttributes={{ preserveDrawingBuffer: true }}
        >
          <PixelEditor
            gridBorder={gridBorder}
            initialTexture={marioPNG}
            drawing={touching}
            color={tool.forceColor || color}
            mouse={[touchPosition.x, touchPosition.y]}
            brushRadius={tool.brushRadius || 0}
            size={size}
            onPaintNodeRef={this.onPaintNodeRef}
          />
        </Surface>
      );
    }

    onColorChange = (rgb) => {
      this.props.setToolState({ color: rgb.concat([1]) });
    };

    paintNode: Node;
    onPaintNodeRef = (ref: Node) => {
      this.paintNode = ref;
    };

    colorPick = ([x, y]: Vec2) => {
      x = Math.floor(x * size[0]);
      y = Math.floor(y * size[1]);
      const ndarray = this.paintNode.capture(x, y, 1, 1);
      this.props.setToolState({
        color: Array.from(ndarray.data).map((n) => n / 255),
      });
    };
  }
);

Example.defaultProps = {
  color: [1, 1, 1, 1],
  toolKey: "brush-4",
};

export default Example;

export { tools };
