//@flow
import React, { PureComponent, Component } from "react";
import ndarray from "ndarray";
import ops from "ndarray-ops";
import { Shaders, Node, GLSL, Bus } from "gl-react";
import { Surface } from "gl-react-dom";
import marioPNG from "./mario.png";
import "./index.css";
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

function getPosition(e: any): Vec2 {
  const rect = e.target.getBoundingClientRect();
  return [
    (e.clientX - rect.left) / rect.width,
    (rect.bottom - e.clientY) / rect.height,
  ];
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

export default class Example extends Component {
  state = {
    drawing: false,
    mouse: [0.5, 0.5],
  };

  render() {
    const { color, toolKey } = this.props;
    const { drawing, mouse } = this.state;
    const tool = tools[toolKey];
    return (
      <div>
        <Surface
          width={128 * 3}
          height={128 * 3}
          preload={[marioPNG]}
          onMouseLeave={this.onMouseLeave}
          onMouseMove={this.onMouseMove}
          onMouseDown={this.onMouseDown}
          onMouseUp={this.onMouseUp}
          webglContextAttributes={{ preserveDrawingBuffer: true }}
          style={{ cursor: "crosshair" }}
        >
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
    const color = [r, g, b].map((n) => n / 255).concat([a]);
    this.props.setToolState({ color });
  };

  paintNode: Node;
  onPaintNodeRef = (ref: Node) => {
    this.paintNode = ref;
  };

  onDownload = () => {
    const captured = this.paintNode.capture();
    const canvas = document.createElement("canvas");
    canvas.width = size[0];
    canvas.height = size[1];
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ops.assign(
      ndarray(imageData.data, [canvas.height, canvas.width, 4]).transpose(
        1,
        0,
        2
      ),
      captured
    );
    ctx.putImageData(imageData, 0, 0);
    canvas.toBlob((blob) => {
      window.open(window.URL.createObjectURL(blob));
    });
  };

  colorPick = ([x, y]: Vec2) => {
    x = Math.floor(x * size[0]);
    y = Math.floor(y * size[1]);
    const ndarray = this.paintNode.capture(x, y, 1, 1);
    this.props.setToolState({
      color: Array.from(ndarray.data).map((n) => n / 255),
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
      mouse: [-1, -1],
    });
  };

  static defaultProps = {
    color: [1, 1, 1, 1],
    toolKey: "brush-4",
  };
}

export { tools };
