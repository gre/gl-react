/* eslint-disable react/no-string-refs */
//@flow

// TODO bus example: a bus that is not used, but use another bus, still should render, and we can capture it.
// TODO texture array is to be tested
// TODO review all our web examples and see if we missed to test something

// Using a single file because it runs sequencially
// and there is no weird issues with headless-gl that way
import {
  Shaders,
  Node,
  LinearCopy,
  NearestCopy,
  GLSL,
  Visitor,
  Visitors,
  Uniform,
  Bus,
  VisitorLogger,
  connectSize
} from "gl-react";
import { globalRegistry } from "webgltexture-loader";
import { Surface } from "gl-react-headless";
import React from "react";
import ndarray from "ndarray";
import invariant from "invariant";

import {
  create,
  CountersVisitor,
  createNDArrayTexture,
  createOneTextureLoader,
  red2x2,
  white3x3,
  yellow3x3,
  yellow3x2,
  expectToBeCloseToColorArray
} from "../utils";

test("renders a red shader", () => {
  const shaders = Shaders.create({
    red: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }`
    }
  });
  const inst = create(
    <Surface
      width={1}
      height={1}
      webglContextAttributes={{ preserveDrawingBuffer: true }}
    >
      <Node shader={shaders.red} />
    </Surface>
  );
  const surface = inst.getInstance();
  expectToBeCloseToColorArray(
    surface.capture().data,
    new Uint8Array([255, 0, 0, 255])
  );
  inst.unmount();
});

test("it does not crash when editing back and forth a shader", () => {
  const fa = GLSL`
precision highp float;
varying vec2 uv;
void main() {
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}`;
  const fb = GLSL`
precision highp float;
varying vec2 uv;
void main() { gl_FragColor=vec4(1.0, 0.0, 0.0, 1.0); }`;
  const inst = create(
    <Surface width={1} height={1}>
      <Node shader={{ frag: fa }} />
    </Surface>
  );
  const surface = inst.getInstance();
  surface.flush();
  inst.update(
    <Surface width={1} height={1}>
      <Node shader={{ frag: fb }} />
    </Surface>
  );
  surface.flush();
  inst.update(
    <Surface width={1} height={1}>
      <Node shader={{ frag: fa }} />
    </Surface>
  );
  surface.flush();
  inst.unmount();
});

test("it does not crash when editing back and forth from a shader that crashed (resilient)", () => {
  const fa = GLSL`
precision highp float;
varying vec2 uv;
void main() {
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}`;
  const fb = GLSL`THIS IS NOT A SHADER`;

  const inst = create(
    <Surface width={1} height={1}>
      <Node shader={{ frag: fa }} />
    </Surface>
  );
  const surface = inst.getInstance();
  surface.flush();

  class IgnoreErrorVisitor extends Visitor {
    onSurfaceDrawError() {
      return true;
    }
  }
  inst.update(
    <Surface visitor={new IgnoreErrorVisitor()} width={1} height={1}>
      <Node shader={{ frag: fb }} />
    </Surface>
  );
  surface.flush();

  inst.update(
    <Surface width={1} height={1}>
      <Node shader={{ frag: fa }} />
    </Surface>
  );
  surface.flush();
  inst.unmount();
});

test("renders HelloGL", () => {
  const shaders = Shaders.create({
    helloGL: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  void main() {
    gl_FragColor = vec4(uv.x, uv.y, 0.5, 1.0);
  }`
    }
  });
  const inst = create(
    <Surface
      width={4}
      height={4}
      webglContextAttributes={{ preserveDrawingBuffer: true }}
    >
      <Node shader={shaders.helloGL} />
    </Surface>
  );
  const surface = inst.getInstance();
  const snap = surface.capture();
  expect(snap.shape).toEqual([4, 4, 4]);
  expectToBeCloseToColorArray(
    snap.data,
    new Uint8Array([
      32,
      32,
      128,
      255,
      96,
      32,
      128,
      255,
      159,
      32,
      128,
      255,
      223,
      32,
      128,
      255,
      32,
      96,
      128,
      255,
      96,
      96,
      128,
      255,
      159,
      96,
      128,
      255,
      223,
      96,
      128,
      255,
      32,
      159,
      128,
      255,
      96,
      159,
      128,
      255,
      159,
      159,
      128,
      255,
      223,
      159,
      128,
      255,
      32,
      223,
      128,
      255,
      96,
      223,
      128,
      255,
      159,
      223,
      128,
      255,
      223,
      223,
      128,
      255
    ])
  );
  inst.unmount();
});

test("ndarray texture", () => {
  const shaders = Shaders.create({
    helloTexture: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  uniform sampler2D t;
  void main() {
    gl_FragColor = texture2D(t, uv);
  }`
    }
  });
  class HelloTextureStateful extends React.Component<*, { t: * }> {
    state = { t: red2x2 };
    node = React.createRef();
    flush() {
      this.node.current.flush();
    }
    render() {
      return (
        <Node
          ref={this.node}
          shader={shaders.helloTexture}
          uniforms={this.state}
        />
      );
    }
  }
  let helloTexture: ?HelloTextureStateful;
  const inst = create(
    <Surface
      width={64}
      height={64}
      webglContextAttributes={{ preserveDrawingBuffer: true }}
    >
      <HelloTextureStateful ref={ref => (helloTexture = ref)} />
    </Surface>
  );
  invariant(helloTexture, "helloTexture is defined");
  const surface = inst.getInstance();
  expectToBeCloseToColorArray(
    surface.capture(0, 0, 1, 1).data,
    new Uint8Array([255, 0, 0, 255])
  );
  helloTexture.setState({ t: yellow3x3 });
  helloTexture.flush();
  expectToBeCloseToColorArray(
    surface.capture(0, 0, 1, 1).data,
    new Uint8Array([255, 255, 0, 255])
  );
  helloTexture.setState({ t: null });
  helloTexture.flush();
  expectToBeCloseToColorArray(
    surface.capture(0, 0, 1, 1).data,
    new Uint8Array([0, 0, 0, 0])
  );
  inst.unmount();
});

test("renders a color uniform", () => {
  const shaders = Shaders.create({
    clr: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  uniform vec4 color;
  void main() {
    gl_FragColor = color;
  }`
    }
  });

  class ColorSurface extends React.Component<*> {
    surface = React.createRef();
    render() {
      const { color } = this.props;
      return (
        <Surface
          ref={this.surface}
          width={1}
          height={1}
          webglContextAttributes={{ preserveDrawingBuffer: true }}
        >
          <Node shader={shaders.clr} uniforms={{ color }} />
        </Surface>
      );
    }
  }

  const inst = create(<ColorSurface color={[1, 0, 0, 1]} />);
  const surface = inst.getInstance().surface.current;
  expectToBeCloseToColorArray(
    surface.capture().data,
    new Uint8Array([255, 0, 0, 255])
  );
  inst.update(<ColorSurface color={[0, 1, 0, 1]} />);
  surface.flush();
  expectToBeCloseToColorArray(
    surface.capture().data,
    new Uint8Array([0, 255, 0, 255])
  );
  inst.update(<ColorSurface color={[0.5, 0, 1, 1]} />);
  surface.flush();
  expectToBeCloseToColorArray(
    surface.capture().data,
    new Uint8Array([128, 0, 255, 255])
  );
  inst.unmount();
});

test("use the imperative setDrawProps escape hatch", () => {
  const shaders = Shaders.create({
    clr: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  uniform vec4 color;
  void main() {
    gl_FragColor = color;
  }`
    },
    white: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  void main() {
    gl_FragColor = vec4(1.0);
  }`
    }
  });

  let node;
  const inst = create(
    <Surface
      width={1}
      height={1}
      webglContextAttributes={{ preserveDrawingBuffer: true }}
    >
      <Node
        ref={ref => {
          node = ref;
        }}
        shader={shaders.clr}
        uniforms={{ color: [1, 0, 0, 1] }}
      />
    </Surface>
  );
  const surface = inst.getInstance();
  invariant(node, "nodeRef is set");
  expectToBeCloseToColorArray(
    surface.capture().data,
    new Uint8Array([255, 0, 0, 255])
  );
  node.setDrawProps({
    uniforms: {
      color: [1, 1, 0, 1]
    }
  });
  // check it's still lazy
  expectToBeCloseToColorArray(
    surface.capture().data,
    new Uint8Array([255, 0, 0, 255])
  );
  surface.flush();
  expectToBeCloseToColorArray(
    surface.capture().data,
    new Uint8Array([255, 255, 0, 255])
  );
  node.setDrawProps({
    shader: shaders.white,
    uniforms: {}
  });
  surface.flush();
  expectToBeCloseToColorArray(
    surface.capture().data,
    new Uint8Array([255, 255, 255, 255])
  );
  inst.unmount();
});

test("composes color uniform with LinearCopy", () => {
  const shaders = Shaders.create({
    clr: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  uniform vec4 color;
  void main() {
    gl_FragColor = color;
  }`
    }
  });

  class ColorSurface extends React.Component<*> {
    render() {
      const { color } = this.props;
      return (
        <Surface
          ref="surface"
          width={1}
          height={1}
          webglContextAttributes={{ preserveDrawingBuffer: true }}
        >
          <LinearCopy>
            <Node shader={shaders.clr} uniforms={{ color }} />
          </LinearCopy>
        </Surface>
      );
    }
  }
  const inst = create(<ColorSurface color={[0, 0, 1, 1]} />);
  const surface = inst.getInstance().refs.surface;
  expectToBeCloseToColorArray(
    surface.capture().data,
    new Uint8Array([0, 0, 255, 255])
  );
  inst.unmount();
});

test("no needs to flush if use of sync", () => {
  const shaders = Shaders.create({
    clr: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  uniform vec4 color;
  void main() {
    gl_FragColor = color;
  }`
    }
  });

  class ColorSurface extends React.Component<*> {
    render() {
      const { color } = this.props;
      return (
        <Surface
          ref="surface"
          width={1}
          height={1}
          webglContextAttributes={{ preserveDrawingBuffer: true }}
        >
          <LinearCopy>
            <Node sync shader={shaders.clr} uniforms={{ color }} />
          </LinearCopy>
        </Surface>
      );
    }
  }

  const inst = create(<ColorSurface color={[1, 0, 0, 1]} />);
  const surface = inst.getInstance().refs.surface;
  expectToBeCloseToColorArray(
    surface.capture().data,
    new Uint8Array([255, 0, 0, 255])
  );
  inst.update(<ColorSurface color={[0, 1, 0, 1]} />);
  expectToBeCloseToColorArray(
    surface.capture().data,
    new Uint8Array([0, 255, 0, 255])
  );
  inst.update(<ColorSurface color={[0, 0, 1, 1]} />);
  expectToBeCloseToColorArray(
    surface.capture().data,
    new Uint8Array([0, 0, 255, 255])
  );
  inst.unmount();
});

test("Node can have a different size and be scaled up", () => {
  const shaders = Shaders.create({
    red: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }`
    }
  });
  const inst = create(
    <Surface
      width={200}
      height={200}
      webglContextAttributes={{ preserveDrawingBuffer: true }}
    >
      <LinearCopy>
        <Node width={1} height={1} shader={shaders.red} />
      </LinearCopy>
    </Surface>
  );
  const surface = inst.getInstance();
  expectToBeCloseToColorArray(
    surface.capture(100, 100, 1, 1).data,
    new Uint8Array([255, 0, 0, 255])
  );
  inst.unmount();
});

test("Surface can be resized", () => {
  const shaders = Shaders.create({
    red: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }`
    }
  });
  const renderForSize = (width, height) => (
    <Surface
      width={width}
      height={height}
      webglContextAttributes={{ preserveDrawingBuffer: true }}
    >
      <LinearCopy>
        <Node shader={shaders.red} backbuffering />
      </LinearCopy>
    </Surface>
  );
  const inst = create(renderForSize(1, 1));
  const surface = inst.getInstance();
  inst.update(renderForSize(20, 20));
  surface.flush();
  expectToBeCloseToColorArray(
    surface.capture(10, 10, 1, 1).data,
    new Uint8Array([255, 0, 0, 255])
  );
  inst.update(renderForSize(100, 100));
  surface.flush();
  inst.update(renderForSize(120, 100));
  surface.flush();
  inst.update(renderForSize(100, 500));
  surface.flush();
  inst.update(renderForSize(500, 100));
  surface.flush();
  expectToBeCloseToColorArray(
    surface.capture(400, 50, 1, 1).data,
    new Uint8Array([255, 0, 0, 255])
  );
  inst.unmount();
});

test("bus uniform code style", () => {
  const shaders = Shaders.create({
    red: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }`
    },
    helloTexture: {
      frag: GLSL`
      precision highp float;
      varying vec2 uv;
      uniform sampler2D t;
      void main() {
        gl_FragColor = texture2D(t, uv);
      }`
    }
  });
  const inst = create(
    <Surface
      width={20}
      height={20}
      webglContextAttributes={{ preserveDrawingBuffer: true }}
    >
      <Node shader={shaders.helloTexture}>
        <Bus uniform="t">
          <Node shader={shaders.red} />
        </Bus>
      </Node>
    </Surface>
  );
  expectToBeCloseToColorArray(
    inst.getInstance().capture(10, 10, 1, 1).data,
    new Uint8Array([255, 0, 0, 255])
  );
  inst.unmount();
});

test("bus example 1", () => {
  const shaders = Shaders.create({
    red: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }`
    }
  });
  class Example extends React.Component<*> {
    render() {
      return (
        <Surface
          width={20}
          height={20}
          webglContextAttributes={{ preserveDrawingBuffer: true }}
        >
          <Bus ref="bus">
            <Node shader={shaders.red} />
          </Bus>
          <LinearCopy>{() => this.refs.bus}</LinearCopy>
        </Surface>
      );
    }
  }
  const inst = create(<Example />);
  expectToBeCloseToColorArray(
    inst.getInstance().refs.bus.capture(10, 10, 1, 1).data,
    new Uint8Array([255, 0, 0, 255])
  );
  inst.unmount();
});

test("bus example 2", () => {
  const shaders = Shaders.create({
    red: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }`
    }
  });
  class Example extends React.Component<*> {
    render() {
      return (
        <Surface
          ref="surface"
          width={20}
          height={20}
          webglContextAttributes={{ preserveDrawingBuffer: true }}
        >
          <Bus ref="bus1">
            <Node width={1} height={2} shader={shaders.red} />
          </Bus>
          <Bus ref="bus2">
            <LinearCopy>{() => this.refs.bus1}</LinearCopy>
          </Bus>
          <LinearCopy>{() => this.refs.bus2}</LinearCopy>
        </Surface>
      );
    }
  }
  const inst = create(<Example />);
  const surface = inst.getInstance().refs.surface;
  expectToBeCloseToColorArray(
    surface.capture(10, 10, 1, 1).data,
    new Uint8Array([255, 0, 0, 255])
  );
  inst.unmount();
});

test("bus example 3", () => {
  const shaders = Shaders.create({
    red: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }`
    }
  });
  class Red extends React.Component<*> {
    render() {
      return <Node shader={shaders.red} />;
    }
  }
  class Example extends React.Component<*> {
    render() {
      return (
        <Surface
          ref="surface"
          visitor={new Visitor()}
          width={20}
          height={20}
          webglContextAttributes={{ preserveDrawingBuffer: true }}
        >
          <Bus ref="bus">
            <Red />
          </Bus>
          <LinearCopy>{() => this.refs.bus}</LinearCopy>
        </Surface>
      );
    }
  }
  const inst = create(<Example />);
  const surface = inst.getInstance().refs.surface;
  expectToBeCloseToColorArray(
    surface.capture(10, 10, 1, 1).data,
    new Uint8Array([255, 0, 0, 255])
  );
  inst.unmount();
});

test("bus example 4", () => {
  const shaders = Shaders.create({
    red: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }`
    },
    helloTexture: {
      frag: GLSL`
      precision highp float;
      varying vec2 uv;
      uniform sampler2D t;
      void main() {
        gl_FragColor = texture2D(t, uv);
      }`
    }
  });
  class Example extends React.Component<*> {
    render() {
      return (
        <Surface
          ref="surface"
          width={20}
          height={20}
          webglContextAttributes={{ preserveDrawingBuffer: true }}
        >
          <Node
            shader={shaders.helloTexture}
            uniforms={{
              t: () => this.refs.red
            }}
          >
            <Node ref="red" width={1} height={1} shader={shaders.red} />
          </Node>
        </Surface>
      );
    }
  }
  const inst = create(<Example />);
  const surface = inst.getInstance().refs.surface;
  expectToBeCloseToColorArray(
    surface.capture(10, 10, 1, 1).data,
    new Uint8Array([255, 0, 0, 255])
  );
  inst.unmount();
});

test("bus example 5", () => {
  const shaders = Shaders.create({
    red: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }`
    },
    helloTexture: {
      frag: GLSL`
      precision highp float;
      varying vec2 uv;
      uniform sampler2D t;
      void main() {
        gl_FragColor = texture2D(t, uv);
      }`
    }
  });
  class Red extends React.Component<*> {
    render() {
      return <Node shader={shaders.red} />;
    }
  }
  class Root extends React.Component<*> {
    render() {
      return (
        <Node
          shader={shaders.helloTexture}
          uniforms={{
            t: () => this.refs.red
          }}
        >
          <Bus ref="red">
            <Red />
          </Bus>
        </Node>
      );
    }
  }
  const inst = create(
    <Surface
      width={20}
      height={20}
      visitor={new Visitor()}
      webglContextAttributes={{ preserveDrawingBuffer: true }}
    >
      <Root />
    </Surface>
  );
  const surface = inst.getInstance();
  expectToBeCloseToColorArray(
    surface.capture(10, 10, 1, 1).data,
    new Uint8Array([255, 0, 0, 255])
  );
  inst.unmount();
});

test("bus example 6", () => {
  const shaders = Shaders.create({
    red: {
      frag: GLSL`
  precision highp float;
  void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }
`
    },
    pink: {
      frag: GLSL`
  precision highp float;
  void main() {
    gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
  }
  `
    },
    helloTexture: {
      frag: GLSL`
      precision highp float;
      varying vec2 uv;
      uniform sampler2D t;
      void main() {
        gl_FragColor = texture2D(t, uv);
      }
      `
    }
  });
  class Red extends React.Component<*> {
    render() {
      return <Node shader={shaders.red} />;
    }
  }
  class Pink extends React.Component<*> {
    render() {
      return <Node shader={shaders.pink} />;
    }
  }
  class Root extends React.Component<*> {
    render() {
      const { pink } = this.props;
      return (
        <Node
          shader={shaders.helloTexture}
          uniforms={{
            t: () => (pink ? this.refs.pink : this.refs.red)
          }}
        >
          <Bus ref="red">
            <Red />
          </Bus>
          <Bus ref="pink">
            <Pink />
          </Bus>
        </Node>
      );
    }
  }
  const inst = create(
    <Surface
      width={20}
      height={20}
      visitor={new Visitor()}
      webglContextAttributes={{ preserveDrawingBuffer: true }}
    >
      <Root pink={false} />
    </Surface>
  );
  const surface = inst.getInstance();
  expectToBeCloseToColorArray(
    surface.capture(10, 10, 1, 1).data,
    new Uint8Array([255, 0, 0, 255])
  );
  inst.update(
    <Surface
      width={20}
      height={20}
      webglContextAttributes={{ preserveDrawingBuffer: true }}
    >
      <Root pink={true} />
    </Surface>
  );
  surface.flush();
  expectToBeCloseToColorArray(
    surface.capture(10, 10, 1, 1).data,
    new Uint8Array([255, 0, 255, 255])
  );
  inst.unmount();
});

test("bus: same texture used in multiple sampler2D is fine", () => {
  const shaders = Shaders.create({
    orangy: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  void main() {
    gl_FragColor = vec4(0.5, 0.2, 0.1, 0.4);
  }`
    },
    add: {
      frag: GLSL`
        precision highp float;
        varying vec2 uv;
        uniform sampler2D a, b;
        void main() {
          gl_FragColor = texture2D(a, uv) + texture2D(b, uv);
        }
      `
    }
  });
  class Example extends React.Component<*> {
    render() {
      return (
        <Surface
          ref="surface"
          width={20}
          height={20}
          webglContextAttributes={{ preserveDrawingBuffer: true }}
        >
          <Bus ref="bus">
            <Node shader={shaders.orangy} />
          </Bus>
          <Node
            shader={shaders.add}
            uniforms={{
              a: () => this.refs.bus,
              b: () => this.refs.bus
            }}
          />
        </Surface>
      );
    }
  }
  const inst = create(<Example />);
  expectToBeCloseToColorArray(
    inst.getInstance().refs.surface.capture(10, 10, 1, 1).data,
    new Uint8Array([255, 102, 50, 204])
  );
  inst.unmount();
});

test("a surface can be captured and resized", () => {
  const shaders = Shaders.create({
    helloGL: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  void main() {
    gl_FragColor = vec4(uv.x, uv.y, 0.0, 1.0);
  }`
    }
  });
  const render = (w, h) => (
    <Surface width={w} height={h}>
      <LinearCopy>
        <Node shader={shaders.helloGL} width={2} height={2} />
      </LinearCopy>
    </Surface>
  );
  const inst = create(render(2, 2));
  const surface = inst.getInstance();
  expectToBeCloseToColorArray(
    surface.capture(0, 1, 1, 1).data,
    new Uint8Array([64, 191, 0, 255])
  );
  inst.update(render(20, 20));
  surface.flush();
  expectToBeCloseToColorArray(
    surface.capture(12, 1, 2, 1).data,
    new Uint8Array([159, 64, 0, 255, 172, 64, 0, 255])
  );
  inst.unmount();
});

test("a node can be captured and resized", () => {
  const shaders = Shaders.create({
    helloGL: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  void main() {
    gl_FragColor = vec4(uv.x, uv.y, 0.0, 1.0);
  }`
    }
  });
  let node;
  const render = (w, h) => (
    <Surface width={20} height={20}>
      <LinearCopy>
        <Node
          shader={shaders.helloGL}
          ref={ref => (node = ref)}
          width={w}
          height={h}
        />
      </LinearCopy>
    </Surface>
  );
  const inst = create(render(2, 2));
  const surface = inst.getInstance();
  invariant(node, "node is defined");
  expectToBeCloseToColorArray(
    node.capture(0, 1, 1, 1).data,
    new Uint8Array([64, 191, 0, 255])
  );
  inst.update(render(20, 20));
  surface.flush();
  expectToBeCloseToColorArray(
    node.capture(12, 1, 1, 2).data,
    new Uint8Array([159, 19, 0, 255, 159, 32, 0, 255])
  );
  inst.unmount();
});

test("many Surface updates don't result of many redraws", () => {
  const shaders = Shaders.create({
    justBlue: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  uniform float blue;
  void main() {
    gl_FragColor = vec4(0.0, 0.0, blue, 1.0);
  }`
    }
  });

  const visitor = new CountersVisitor();
  const wrap = children => (
    <Surface
      visitor={visitor}
      width={2}
      height={2}
      webglContextAttributes={{ preserveDrawingBuffer: true }}
    >
      {children}
    </Surface>
  );
  const JustBlue = ({ blue }: { blue: * }) => (
    <Node shader={shaders.justBlue} uniforms={{ blue }} />
  );

  const inst = create(wrap(<JustBlue blue={0} />));
  const surface = inst.getInstance();
  const globalCounters = visitor.getCounters();
  expect(globalCounters.onSurfaceDrawStart).toEqual(1);
  inst.update(wrap(<JustBlue blue={0} />));
  inst.update(wrap(<JustBlue blue={0} />));
  inst.update(wrap(<JustBlue blue={1} />));
  inst.update(wrap(<JustBlue blue={0.5} />));
  inst.update(wrap(<JustBlue blue={0.5} />));
  inst.update(wrap(<JustBlue blue={0} />));
  inst.update(wrap(<JustBlue blue={0.8} />));
  surface.flush();
  expect(globalCounters.onSurfaceDrawStart).toEqual(2);
  inst.update(wrap(<JustBlue blue={0.2} />));
  inst.update(wrap(<JustBlue blue={1} />));
  surface.flush();
  expect(globalCounters.onSurfaceDrawStart).toEqual(3);
  expectToBeCloseToColorArray(
    surface.capture(0, 0, 1, 1).data,
    new Uint8Array([0, 0, 255, 255])
  );
  inst.unmount();
});

test("many Surface flush() don't result of extra redraws", () => {
  const shaders = Shaders.create({
    justBlue: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  uniform float blue;
  void main() {
    gl_FragColor = vec4(0.0, 0.0, blue, 1.0);
  }`
    }
  });
  const visitor = new CountersVisitor();

  const wrap = children => (
    <Surface
      visitor={visitor}
      width={2}
      height={2}
      webglContextAttributes={{ preserveDrawingBuffer: true }}
    >
      {children}
    </Surface>
  );
  const JustBlue = ({ blue }: { blue: * }) => (
    <Node shader={shaders.justBlue} uniforms={{ blue }} />
  );

  const inst = create(wrap(<JustBlue blue={0} />));
  const surface = inst.getInstance();
  const surfaceCounters = visitor.getSurfaceCounters(surface);
  expect(surfaceCounters.onSurfaceDrawStart).toEqual(1);
  surface.flush();
  surface.flush();
  surface.flush();
  expect(surfaceCounters.onSurfaceDrawStart).toEqual(1);
  inst.update(wrap(<JustBlue blue={0} />));
  surface.flush();
  surface.flush();
  surface.flush();
  surface.flush();
  surface.flush();
  expect(surfaceCounters.onSurfaceDrawStart).toEqual(2);
  inst.unmount();
});

test("GL Components that implement shouldComponentUpdate shortcut Surface redraws", () => {
  const shaders = Shaders.create({
    justBlue: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  uniform float blue;
  void main() {
    gl_FragColor = vec4(0.0, 0.0, blue, 1.0);
  }`
    }
  });

  let justBlueNode;
  const visitor = new CountersVisitor();
  Visitors.add(visitor);

  const wrap = children => (
    <Surface
      width={2}
      height={2}
      webglContextAttributes={{ preserveDrawingBuffer: true }}
    >
      <LinearCopy>{children}</LinearCopy>
    </Surface>
  );
  class JustBlue extends React.PureComponent<*> {
    render() {
      const { blue } = this.props;
      return (
        <Node
          ref={ref => {
            justBlueNode = ref;
          }}
          shader={shaders.justBlue}
          uniforms={{ blue }}
        />
      );
    }
  }
  const inst = create(wrap(<JustBlue blue={0} />));
  const surface = inst.getInstance();
  invariant(justBlueNode, "justBlueNode is defined");
  const justBlueNodeCounters = visitor.getNodeCounters(justBlueNode);
  expect(justBlueNodeCounters.onNodeDraw).toEqual(1);
  inst.update(wrap(<JustBlue blue={0} />));
  surface.flush();
  inst.update(wrap(<JustBlue blue={0} />));
  surface.flush();
  inst.update(wrap(<JustBlue blue={0} />));
  surface.flush();
  expect(justBlueNodeCounters.onNodeDraw).toEqual(1);
  inst.update(wrap(<JustBlue blue={1} />));
  surface.flush();
  expect(justBlueNodeCounters.onNodeDraw).toEqual(2);
  inst.update(wrap(<JustBlue blue={1} />));
  surface.flush();
  expect(justBlueNodeCounters.onNodeDraw).toEqual(2);
  inst.update(wrap(<JustBlue blue={0.4} />));
  inst.update(wrap(<JustBlue blue={0.5} />));
  surface.flush();
  expect(justBlueNodeCounters.onNodeDraw).toEqual(3);
  invariant(justBlueNode, "justBlueNode is defined");
  justBlueNode.flush();
  justBlueNode.flush();
  expect(justBlueNodeCounters.onNodeDraw).toEqual(3);
  Visitors.remove(visitor);
  inst.unmount();
  Visitors.remove(visitor);
});

test("nested GL Component update will re-draw the Surface", () => {
  const shaders = Shaders.create({
    justBlue: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  uniform float blue;
  void main() {
    gl_FragColor = vec4(0.0, 0.0, blue, 1.0);
  }`
    }
  });

  let justBlue, justBlueNode;
  const visitor = new CountersVisitor();

  class StatefulJustBlue extends React.Component<*, { blue: number }> {
    state = { blue: 0 };
    render() {
      const { blue } = this.state;
      return (
        <Node
          ref={ref => (justBlueNode = ref)}
          shader={shaders.justBlue}
          uniforms={{ blue }}
        />
      );
    }
  }
  const inst = create(
    <Surface
      visitor={visitor}
      width={2}
      height={2}
      webglContextAttributes={{ preserveDrawingBuffer: true }}
    >
      <LinearCopy>
        <LinearCopy>
          <StatefulJustBlue ref={ref => (justBlue = ref)} />
        </LinearCopy>
      </LinearCopy>
    </Surface>
  );

  const surface = inst.getInstance();

  invariant(justBlue, "justBlue is defined");
  invariant(justBlueNode, "justBlueNode is defined");
  const surfaceCounters = visitor.getSurfaceCounters(surface);
  const justBlueNodeCounters = visitor.getNodeCounters(justBlueNode);
  expect(surfaceCounters.onSurfaceDrawStart).toEqual(1);
  expect(justBlueNodeCounters.onNodeDraw).toEqual(1);
  justBlue.setState({ blue: 0.1 });
  justBlueNode.flush();
  expect(surfaceCounters.onSurfaceDrawStart).toEqual(2);
  expect(justBlueNodeCounters.onNodeDraw).toEqual(2);
  justBlue.setState({ blue: 0.0 });
  justBlue.setState({ blue: 0.1 });
  justBlue.setState({ blue: 0.2 });
  justBlueNode.flush();
  justBlueNode.flush();
  expect(surfaceCounters.onSurfaceDrawStart).toEqual(3);
  expect(justBlueNodeCounters.onNodeDraw).toEqual(3);
  surface.flush();
  expect(surfaceCounters.onSurfaceDrawStart).toEqual(3);
  expect(justBlueNodeCounters.onNodeDraw).toEqual(3);
  justBlue.setState({ blue: 0.3 });
  surface.flush();
  expect(surfaceCounters.onSurfaceDrawStart).toEqual(4);
  expect(justBlueNodeCounters.onNodeDraw).toEqual(4);
  justBlue.setState({ blue: 1 });
  justBlueNode.flush();
  expect(surfaceCounters.onSurfaceDrawStart).toEqual(5);
  expect(justBlueNodeCounters.onNodeDraw).toEqual(5);
  expectToBeCloseToColorArray(
    surface.capture(0, 0, 1, 1).data,
    new Uint8Array([0, 0, 255, 255])
  );
  inst.unmount();
});

test("Node `clear` and discard;", () => {
  const shaders = Shaders.create({
    paint: {
      frag: GLSL`
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
  }`
    }
  });
  class Paint extends React.Component<
    *,
    {
      drawing: boolean,
      color: [number, number, number, number],
      center: [number, number],
      brushRadius: number
    }
  > {
    state = {
      drawing: false,
      color: [0, 0, 0, 0],
      center: [0, 0],
      brushRadius: 0.2
    };
    render() {
      return <Node shader={shaders.paint} clear={null} uniforms={this.state} />;
    }
  }
  let paint: ?Paint;
  const inst = create(
    <Surface
      width={10}
      height={10}
      webglContextAttributes={{ preserveDrawingBuffer: true }}
    >
      <NearestCopy>
        <Paint width={100} height={100} ref={ref => (paint = ref)} />
      </NearestCopy>
    </Surface>
  );
  invariant(paint, "paint is defined");
  const surface = inst.getInstance();
  expectToBeCloseToColorArray(
    surface.capture(0, 0, 1, 1).data,
    new Uint8Array([0, 0, 0, 0])
  );
  paint.setState({
    drawing: true,
    color: [1, 0, 0, 1],
    center: [0, 0],
    brushRadius: 0.6
  });
  surface.flush();
  expectToBeCloseToColorArray(
    surface.capture(0, 0, 1, 1).data,
    new Uint8Array([255, 0, 0, 255])
  );
  expectToBeCloseToColorArray(
    surface.capture(7, 7, 1, 1).data,
    new Uint8Array([0, 0, 0, 0])
  );
  paint.setState({
    drawing: true,
    color: [0, 1, 0, 1],
    center: [0.1, 0.1],
    brushRadius: 0.2
  });
  surface.flush();
  paint.setState({
    drawing: false, // actually not drawing here ;)
    color: [1, 0, 0, 1],
    center: [0, 0],
    brushRadius: 0.6
  });
  surface.flush();
  expectToBeCloseToColorArray(
    surface.capture(0, 0, 1, 1).data,
    new Uint8Array([0, 255, 0, 255])
  );
  expectToBeCloseToColorArray(
    surface.capture(3, 3, 1, 1).data,
    new Uint8Array([255, 0, 0, 255])
  );
  expectToBeCloseToColorArray(
    surface.capture(7, 7, 1, 1).data,
    new Uint8Array([0, 0, 0, 0])
  );
  inst.unmount();
});

test("Node `backbuffering`", () => {
  const shaders = Shaders.create({
    colorShift: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  uniform sampler2D t;
  void main() {
    vec4 c = texture2D(t, uv);
    gl_FragColor = vec4(c.b, c.r, c.g, c.a); // shifting the rgb components
  }`
    }
  });
  const render = t => (
    <Surface
      width={10}
      height={10}
      webglContextAttributes={{ preserveDrawingBuffer: true }}
    >
      <LinearCopy>
        <Node shader={shaders.colorShift} uniforms={{ t }} backbuffering />
      </LinearCopy>
    </Surface>
  );
  const inst = create(render(red2x2)); // init with red
  const surface = inst.getInstance();
  expectToBeCloseToColorArray(
    surface.capture(0, 0, 1, 1).data,
    new Uint8Array([0, 255, 0, 255])
  );
  inst.update(render(red2x2));
  surface.flush();

  // since node was drawn once, there were a first shift.
  expectToBeCloseToColorArray(
    surface.capture(0, 0, 1, 1).data,
    new Uint8Array([0, 255, 0, 255])
  );
  inst.update(render(Uniform.Backbuffer));
  surface.flush();
  expectToBeCloseToColorArray(
    surface.capture(0, 0, 1, 1).data,
    new Uint8Array([0, 0, 255, 255])
  );
  inst.update(render(Uniform.Backbuffer));
  surface.flush();
  expectToBeCloseToColorArray(
    surface.capture(0, 0, 1, 1).data,
    new Uint8Array([255, 0, 0, 255])
  );
  inst.update(render(Uniform.Backbuffer));
  inst.update(render(Uniform.Backbuffer));
  surface.flush();
  expectToBeCloseToColorArray(
    surface.capture(0, 0, 1, 1).data,
    new Uint8Array([0, 255, 0, 255])
  );
  surface.glView.simulateContextLost();
  inst.unmount();
});

test("Node `backbuffering` in `sync`", () => {
  const shaders = Shaders.create({
    colorShift: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  uniform sampler2D t;
  void main() {
    vec4 c = texture2D(t, uv);
    gl_FragColor = vec4(c.b, c.r, c.g, c.a); // shifting the rgb components
  }`
    }
  });
  const render = t => (
    <Surface
      width={10}
      height={10}
      webglContextAttributes={{ preserveDrawingBuffer: true }}
    >
      <LinearCopy>
        <LinearCopy>
          <Node
            shader={shaders.colorShift}
            uniforms={{ t }}
            backbuffering
            sync
          />
        </LinearCopy>
      </LinearCopy>
    </Surface>
  );
  const inst = create(render(red2x2)); // init with red
  const surface = inst.getInstance();
  // since node was drawn once, there were a first shift.
  expectToBeCloseToColorArray(
    surface.capture(0, 0, 1, 1).data,
    new Uint8Array([0, 255, 0, 255])
  );
  inst.update(render(Uniform.Backbuffer));
  expectToBeCloseToColorArray(
    surface.capture(0, 0, 1, 1).data,
    new Uint8Array([0, 0, 255, 255])
  );
  inst.update(render(Uniform.Backbuffer));
  expectToBeCloseToColorArray(
    surface.capture(0, 0, 1, 1).data,
    new Uint8Array([255, 0, 0, 255])
  );
  inst.update(render(Uniform.Backbuffer));
  inst.update(render(Uniform.Backbuffer));
  expectToBeCloseToColorArray(
    surface.capture(0, 0, 1, 1).data,
    new Uint8Array([0, 0, 255, 255])
  );
  inst.unmount();
});

test("Node `backbuffering` with Uniform.backbufferFrom", () => {
  const shaders = Shaders.create({
    colorShift: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  uniform sampler2D t;
  void main() {
    vec4 c = texture2D(t, uv);
    gl_FragColor = vec4(c.b, c.r, c.g, c.a); // shifting the rgb components
  }`
    },
    darken: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  uniform sampler2D t;
  uniform float m;
  void main() {
    gl_FragColor = m * texture2D(t, uv);
  }`
    }
  });
  class Darken extends React.Component<*> {
    render() {
      const { children: t } = this.props;
      return <Node shader={shaders.darken} uniforms={{ t, m: 0.8 }} />;
    }
  }
  class Effect extends React.Component<*> {
    getMainBuffer = () => {
      const { main } = this.refs;
      return main ? Uniform.backbufferFrom(main.getNodeRef()) : null;
    };
    render() {
      const { initWithImage } = this.props;
      return (
        <Surface
          ref="surface"
          width={10}
          height={10}
          webglContextAttributes={{ preserveDrawingBuffer: true }}
        >
          <NearestCopy>
            <LinearCopy backbuffering ref="main">
              <Darken>
                <Node
                  shader={shaders.colorShift}
                  uniforms={{
                    t: !initWithImage ? this.getMainBuffer : initWithImage
                  }}
                />
              </Darken>
            </LinearCopy>
          </NearestCopy>
        </Surface>
      );
    }
  }

  const inst = create(<Effect initWithImage={red2x2} />);
  const surface = inst.getInstance().refs.surface;

  for (let i = 1; i <= 6; i++) {
    const val = Math.round(255 * Math.pow(0.8, i)); // Darken effect will multiply the color by 0.8 each draw time
    const expected = [0, 0, 0, val];
    expected[i % 3] = val; // the colorShift will shift the r,g,b components with the color val
    expectToBeCloseToColorArray(
      surface.capture(0, 0, 1, 1).data,
      new Uint8Array(expected)
    );
    inst.update(<Effect />);
    surface.flush();
  }

  surface.glView.simulateContextLost();
  inst.unmount();
});

test("texture can be null", () => {
  const shaders = Shaders.create({
    helloTexture: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  uniform sampler2D t;
  void main() {
    gl_FragColor = texture2D(t, uv);
  }`
    }
  });
  const inst = create(
    <Surface
      width={64}
      height={64}
      webglContextAttributes={{ preserveDrawingBuffer: true }}
    >
      <Node shader={shaders.helloTexture} uniforms={{ t: null }} />
    </Surface>
  );
  const surface = inst.getInstance();
  expectToBeCloseToColorArray(
    surface.capture(0, 0, 1, 1).data,
    new Uint8Array([0, 0, 0, 0])
  );
  inst.unmount();
});

test("array of textures", () => {
  class MergeChannels extends React.Component<*> {
    render() {
      const { red, green, blue } = this.props;
      return (
        <Node
          shader={{
            frag: GLSL`
            precision highp float;
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
            }
          `
          }}
          uniforms={{
            channels: [red, green, blue]
          }}
        />
      );
    }
  }

  let bus;
  const inst = create(
    <Surface
      width={1}
      height={1}
      webglContextAttributes={{ preserveDrawingBuffer: true }}
    >
      <Bus ref={ref => (bus = ref)}>
        <faketexture width={3} height={3} getPixels={() => white3x3} />
      </Bus>
      <MergeChannels
        red={() => bus}
        green={
          <LinearCopy>
            <faketexture width={3} height={3} getPixels={() => white3x3} />
          </LinearCopy>
        }
        blue={white3x3}
      />
    </Surface>
  );
  const surface = inst.getInstance();
  expectToBeCloseToColorArray(
    surface.capture().data,
    new Uint8Array([255, 255, 255, 255])
  );
  inst.unmount();
});

test("Node uniformsOptions texture interpolation", () => {
  const shaders = Shaders.create({
    helloTexture: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  uniform sampler2D t;
  void main() {
    gl_FragColor = texture2D(t, uv);
  }`
    }
  });
  function render(t, tOptions) {
    return (
      <Surface
        width={500}
        height={40}
        webglContextAttributes={{ preserveDrawingBuffer: true }}
      >
        <Node
          shader={shaders.helloTexture}
          uniforms={{ t }}
          uniformsOptions={tOptions ? { t: tOptions } : undefined}
          sync
        />
      </Surface>
    );
  }
  const inst = create(render(null));
  const surface = inst.getInstance();
  const redToBlue = ndarray(new Uint8Array([255, 0, 0, 255, 0, 0, 255, 255]), [
    2,
    1,
    4
  ]);
  inst.update(render(redToBlue));
  expectToBeCloseToColorArray(
    surface.capture(0, 2, 1, 1).data,
    new Uint8Array([255, 0, 0, 255])
  );
  expectToBeCloseToColorArray(
    surface.capture(250, 7, 1, 1).data,
    new Uint8Array([127, 0, 128, 255])
  );
  expectToBeCloseToColorArray(
    surface.capture(499, 5, 1, 1).data,
    new Uint8Array([0, 0, 255, 255])
  );
  inst.update(render(redToBlue, { interpolation: "nearest" }));
  expectToBeCloseToColorArray(
    surface.capture(200, 0, 1, 1).data,
    new Uint8Array([255, 0, 0, 255])
  );
  expectToBeCloseToColorArray(
    surface.capture(300, 0, 1, 1).data,
    new Uint8Array([0, 0, 255, 255])
  );
  inst.update(render(redToBlue, { interpolation: "linear" }));
  expectToBeCloseToColorArray(
    surface.capture(0, 2, 1, 1).data,
    new Uint8Array([255, 0, 0, 255])
  );
  expectToBeCloseToColorArray(
    surface.capture(250, 7, 1, 1).data,
    new Uint8Array([127, 0, 128, 255])
  );
  expectToBeCloseToColorArray(
    surface.capture(499, 5, 1, 1).data,
    new Uint8Array([0, 0, 255, 255])
  );
  inst.unmount();
});

test("can be extended with addTextureLoaderClass", async () => {
  const shaders = Shaders.create({
    helloTexture: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  uniform sampler2D t;
  void main() {
    gl_FragColor = texture2D(t, uv);
  }`
    }
  });

  const loader = createOneTextureLoader(
    gl => createNDArrayTexture(gl, red2x2),
    [2, 2]
  );
  globalRegistry.add(loader.Loader);
  const inst = create(
    <Surface
      width={64}
      height={64}
      webglContextAttributes={{ preserveDrawingBuffer: true }}
    >
      <Node shader={shaders.helloTexture} uniforms={{ t: loader.textureId }} />
    </Surface>
  );
  const surface = inst.getInstance();
  surface.flush();
  expectToBeCloseToColorArray(
    surface.capture(0, 0, 1, 1).data,
    new Uint8Array([0, 0, 0, 0])
  );
  expect(loader.counters).toMatchSnapshot();
  await loader.resolve();
  surface.flush();
  expectToBeCloseToColorArray(
    surface.capture(0, 0, 1, 1).data,
    new Uint8Array([255, 0, 0, 255])
  );
  expect(loader.counters).toMatchSnapshot();
  inst.unmount();
  expect(loader.counters).toMatchSnapshot();
  globalRegistry.remove(loader.Loader);
});

test("Surface `preload` prevent to draw anything", async () => {
  const shaders = Shaders.create({
    helloTexture: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  uniform sampler2D t;
  void main() {
    gl_FragColor = texture2D(t, uv);
  }`
    }
  });

  let onLoadCounter = 0;
  const visitor = new CountersVisitor();
  const loader = createOneTextureLoader(
    gl => createNDArrayTexture(gl, red2x2),
    [2, 2]
  );
  globalRegistry.add(loader.Loader);
  const el = (
    <Surface
      width={64}
      height={64}
      visitor={visitor}
      onLoad={() => {
        ++onLoadCounter;
      }}
      preload={[loader.textureId]}
      webglContextAttributes={{ preserveDrawingBuffer: true }}
    >
      <Node shader={shaders.helloTexture} uniforms={{ t: loader.textureId }} />
    </Surface>
  );
  const inst = create(el);
  const surface = inst.getInstance();
  const counters = visitor.getCounters();
  surface.flush();
  inst.update(el);
  surface.flush();
  inst.update(el);
  surface.flush();
  expect(counters.onSurfaceDrawEnd).toEqual(0);
  expect(onLoadCounter).toEqual(0);
  await loader.resolve();
  surface.flush();
  expect(onLoadCounter).toEqual(1);
  expect(counters.onSurfaceDrawEnd).toEqual(1);
  expectToBeCloseToColorArray(
    surface.capture(0, 0, 1, 1).data,
    new Uint8Array([255, 0, 0, 255])
  );
  inst.unmount();
  globalRegistry.remove(loader.Loader);
});

test("Uniform.textureSizeRatio allows to send the ratio of a texture in uniform", async () => {
  const shaders = Shaders.create({
    contain: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  uniform sampler2D t;
  uniform float tRatio;
  void main() {
    vec2 p = uv * vec2(max(1.0, 1.0/tRatio), max(1.0, tRatio)); // "contain" the texture to preserve ratio (without center alignment)
    gl_FragColor =
      step(0.0, p.x) * step(p.x, 1.0) * // returns 1.0 if x is in [0,1] otherwise 0.0
      step(0.0, p.y) * step(p.y, 1.0) * // returns 1.0 if y is in [0,1] otherwise 0.0
      texture2D(t, p);
  }`
    }
  });
  const loader = createOneTextureLoader(
    gl => createNDArrayTexture(gl, yellow3x2),
    [3, 2]
  );
  globalRegistry.add(loader.Loader);
  const el = (
    <Surface
      width={64}
      height={64}
      webglContextAttributes={{ preserveDrawingBuffer: true }}
    >
      <Node
        shader={shaders.contain}
        uniforms={{
          t: loader.textureId,
          tRatio: Uniform.textureSizeRatio(loader.textureId)
        }}
      />
    </Surface>
  );
  const inst = create(el);
  const surface = inst.getInstance();
  await loader.resolve();
  surface.flush();
  expectToBeCloseToColorArray(
    surface.capture(0, 0, 1, 1).data,
    new Uint8Array([255, 255, 0, 255])
  );
  expectToBeCloseToColorArray(
    surface.capture(0, 32, 1, 1).data,
    new Uint8Array([255, 255, 0, 255])
  );
  expectToBeCloseToColorArray(
    surface.capture(0, 63, 1, 1).data,
    new Uint8Array([0, 0, 0, 0])
  );
  inst.unmount();
  globalRegistry.remove(loader.Loader);
});

test("Surface `preload` that fails will trigger onLoadError", async () => {
  const shaders = Shaders.create({
    helloTexture: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  uniform sampler2D t;
  void main() {
    gl_FragColor = texture2D(t, uv);
  }`
    }
  });

  let onLoadCounter = 0;
  let onLoadErrorCounter = 0;
  const loader = createOneTextureLoader(
    gl => createNDArrayTexture(gl, red2x2),
    [2, 2]
  );
  globalRegistry.add(loader.Loader);
  const el = (
    <Surface
      width={64}
      height={64}
      onLoad={() => {
        ++onLoadCounter;
      }}
      onLoadError={() => {
        ++onLoadErrorCounter;
      }}
      preload={[loader.textureId]}
      webglContextAttributes={{ preserveDrawingBuffer: true }}
    >
      <Node shader={shaders.helloTexture} uniforms={{ t: loader.textureId }} />
    </Surface>
  );
  const inst = create(el);
  await loader.reject(new Error("simulate texture fail"));
  expect(onLoadCounter).toEqual(0);
  expect(onLoadErrorCounter).toEqual(1);
  globalRegistry.remove(loader.Loader);
  inst.unmount();
  globalRegistry.remove(loader.Loader);
  globalRegistry.remove(loader.Loader);
});

test("renders a shader inline in the Node", () => {
  class ColorSurface extends React.Component<*> {
    render() {
      const { color } = this.props;
      return (
        <Surface
          ref="surface"
          width={1}
          height={1}
          webglContextAttributes={{ preserveDrawingBuffer: true }}
        >
          <Node
            shader={{
              frag: GLSL`
precision highp float;
varying vec2 uv;
uniform vec4 color;
void main() { gl_FragColor = color; }
`
            }}
            uniforms={{ color }}
          />
        </Surface>
      );
    }
  }

  const inst = create(<ColorSurface color={[1, 0, 0, 1]} />);
  const surface = inst.getInstance().refs.surface;
  expectToBeCloseToColorArray(
    surface.capture().data,
    new Uint8Array([255, 0, 0, 255])
  );
  inst.update(<ColorSurface color={[0, 1, 0, 1]} />);
  surface.flush();
  expectToBeCloseToColorArray(
    surface.capture().data,
    new Uint8Array([0, 255, 0, 255])
  );
  inst.update(<ColorSurface color={[0.5, 0, 1, 1]} />);
  surface.flush();
  expectToBeCloseToColorArray(
    surface.capture().data,
    new Uint8Array([128, 0, 255, 255])
  );
  surface.glView.simulateContextLost();
  inst.unmount();
});

test("testing connectSize() feature", () => {
  const shaders = Shaders.create({
    Useless: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  uniform vec2 size;
  void main() {
    gl_FragColor = vec4(size.x / 50.0, size.y / 50.0, 0.0, 1.0);
  }`
    }
  });

  class Useless extends React.Component<*> {
    render() {
      const { width, height } = this.props;
      return (
        <Node shader={shaders.Useless} uniforms={{ size: [width, height] }} />
      );
    }
  }

  const ConnectedUseless = connectSize(Useless);

  const inst = create(
    <Surface
      width={30}
      height={20}
      webglContextAttributes={{ preserveDrawingBuffer: true }}
    >
      <ConnectedUseless />
    </Surface>
  );
  const surface = inst.getInstance();
  expectToBeCloseToColorArray(
    surface.capture(1, 1, 1, 1).data,
    new Uint8Array([153, 102, 0, 255])
  );

  inst.update(
    <Surface
      width={30}
      height={20}
      webglContextAttributes={{ preserveDrawingBuffer: true }}
    >
      <ConnectedUseless width={3} height={2} />
    </Surface>
  );
  surface.flush();
  expectToBeCloseToColorArray(
    surface.capture(1, 1, 1, 1).data,
    new Uint8Array([15, 10, 0, 255])
  );

  inst.update(
    <Surface
      width={600}
      height={400}
      webglContextAttributes={{ preserveDrawingBuffer: true }}
    >
      <ConnectedUseless width={30} />
    </Surface>
  );
  surface.flush();
  inst.update(
    <Surface
      width={600}
      height={400}
      webglContextAttributes={{ preserveDrawingBuffer: true }}
    >
      <ConnectedUseless width={30} />
    </Surface>
  );
  surface.flush();
  expectToBeCloseToColorArray(
    surface.capture(1, 1, 1, 1).data,
    new Uint8Array([153, 255, 0, 255])
  );
  inst.unmount();
});

test("handle context lost nicely", () => {
  let surface;
  let contextLost = 0,
    contextRestored = 0;
  class Example extends React.Component<*> {
    render() {
      return (
        <Surface
          ref={ref => (surface = ref)}
          width={20}
          height={20}
          onContextLost={() => {
            ++contextLost;
          }}
          onContextRestored={() => {
            ++contextRestored;
          }}
          webglContextAttributes={{ preserveDrawingBuffer: true }}
        >
          <NearestCopy>
            <faketexture width={2} height={2} getPixels={() => red2x2} />
          </NearestCopy>
        </Surface>
      );
    }
  }
  const inst = create(<Example />);
  invariant(surface, "surface is defined");
  surface.glView.simulateContextLost();
  expect(contextLost).toEqual(1);
  inst.update(<Example />);
  surface.glView.simulateContextRestored();
  expect(contextRestored).toEqual(1);
  surface.redraw();
  surface.flush();
  surface.glView.simulateContextLost();
  inst.update(<Example />);
  inst.update(<Example />);
  inst.update(<Example />);
  inst.update(<Example />);
  inst.update(<Example />);
  surface.glView.simulateContextRestored();
  surface.glView.simulateContextLost();
  surface.glView.simulateContextRestored();
  expect(contextLost).toEqual(3);
  expect(contextRestored).toEqual(3);
  surface.flush();
  expectToBeCloseToColorArray(
    surface.capture(1, 1, 1, 1).data,
    new Uint8Array([255, 0, 0, 255])
  );
  inst.unmount();
});

test("Bus#uniform and Bus#index", () => {
  const shaders = Shaders.create({
    clr: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  uniform vec3 c;
  void main() {
    gl_FragColor = vec4(c, 1.0);
  }
      `
    },
    helloTexture3: {
      frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
uniform sampler2D t2[2];
void main() {
  gl_FragColor =
    0.5 * texture2D(t, uv) +
    0.3 * texture2D(t2[0], uv)+
    0.2 * texture2D(t2[1], uv);
}`
    }
  });

  class WeirdSwapping extends React.Component<*> {
    render() {
      const { i } = this.props;
      return (
        <Node shader={shaders.helloTexture3}>
          <Bus uniform={i === 2 ? "t2" : "t"} index={i === 2 ? 1 : 0}>
            <Node shader={shaders.clr} uniforms={{ c: [1, 0, 0] }} />
          </Bus>
          <Bus uniform="t2" index={i === 1 ? 1 : 0}>
            <Node shader={shaders.clr} uniforms={{ c: [0, 1, 0] }} />
          </Bus>
          <Bus
            uniform={i === 2 ? "t" : "t2"}
            index={i === 2 ? 0 : i === 1 ? 0 : 1}
          >
            <Node shader={shaders.clr} uniforms={{ c: [0, 0, 1] }} />
          </Bus>
        </Node>
      );
    }
  }

  const wrap = children => (
    <Surface
      width={4}
      height={4}
      webglContextAttributes={{ preserveDrawingBuffer: true }}
    >
      {children}
    </Surface>
  );

  const inst = create(wrap(<WeirdSwapping i={0} />));
  const surface = inst.getInstance();
  expectToBeCloseToColorArray(
    surface.capture(2, 3, 1, 1).data,
    new Uint8Array([128, 76, 51, 255])
  );
  inst.update(wrap(<WeirdSwapping i={1} />));
  surface.flush();
  expectToBeCloseToColorArray(
    surface.capture(2, 3, 1, 1).data,
    new Uint8Array([128, 51, 76, 255])
  );
  inst.update(wrap(<WeirdSwapping i={2} />));
  surface.flush();
  expectToBeCloseToColorArray(
    surface.capture(2, 3, 1, 1).data,
    new Uint8Array([51, 76, 128, 255])
  );
  inst.unmount();
});

// This test is mainly a placeholder for test coverage^^ for everything related to console.warn/error
test("VisitorLogger + bunch of funky extreme tests", () => {
  const shaders = Shaders.create({
    justBlue: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  uniform vec2 rg;
  uniform float blue;
  void main() {
    gl_FragColor = vec4(rg.x, rg.y, blue, 1.0);
  }`
    },
    helloTexture: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  uniform sampler2D t;
  void main() {
    gl_FragColor = texture2D(t, uv);
  }`
    },
    helloTexture2: {
      frag: GLSL`
  precision highp float;
  varying vec2 uv;
  uniform sampler2D t2[2];
  void main() {
    gl_FragColor = 0.5*(texture2D(t2[0], uv)+texture2D(t2[1], uv));
  }`
    }
  });

  expect(Shaders.getName(shaders.justBlue)).toBeDefined();
  expect(Shaders.getShortName(shaders.helloTexture)).toBeDefined();
  expect(Shaders.get(shaders.helloTexture2)).toBeDefined();

  const oldConsole = console;
  let groupEnd = 0,
    log = 0,
    warn = 0,
    error = 0,
    group = 0;

  // eslint-disable-next-line no-global-assign
  console = {
    ...oldConsole,
    log: () => log++,
    warn: () => warn++,
    error: () => error++,
    group: () => group++,
    groupCollapsed: () => group++,
    groupEnd: () => groupEnd++
  };

  let justBlueNode;
  const visitor = new VisitorLogger();

  const wrap = children => (
    <Surface visitor={visitor} width={2} height={2}>
      <LinearCopy>{children}</LinearCopy>
    </Surface>
  );

  class JustBlue extends React.PureComponent<*> {
    render() {
      const { blue } = this.props;
      return (
        <Node
          ref={ref => {
            justBlueNode = ref;
          }}
          shader={shaders.justBlue}
          uniforms={{ blue, rg: [0, 0] }}
        />
      );
    }
  }
  class BadNode extends React.Component<*> {
    render() {
      const { blue } = this.props;
      return (
        <Node
          ref={ref => {
            if (ref) {
              ref._draw = () => {
                throw new Error("_draw crash simulation");
              };
            }
          }}
          shader={shaders.justBlue}
          uniforms={{ blue, rg: [0, 0] }}
        />
      );
    }
  }
  const MissingOrInvalidUniforms = () => (
    <Node
      ref={ref => {
        justBlueNode = ref;
      }}
      shader={shaders.justBlue}
      uniforms={{ nope: [1, 2] }}
    />
  );

  class TreeWithZombiesDontBreak extends React.Component<*> {
    render() {
      const { blue } = this.props;
      return (
        <LinearCopy>
          <Node shader={shaders.justBlue} uniforms={{ blue, rg: [0, 0] }}>
            <BadNode />
            <Node
              shader={shaders.justBlue}
              uniforms={{ blue, rg: [0, 0] }}
              ref={ref => {
                if (ref) {
                  ref.redraw();
                  ref.flush();
                }
              }}
            />
          </Node>
        </LinearCopy>
      );
    }
  }

  class EmptyBusUsedByANode extends React.Component<*> {
    render() {
      return (
        <Node
          shader={shaders.helloTexture}
          uniforms={{ t: () => this.refs.bus }}
        >
          <Bus ref="bus" />
        </Node>
      );
    }
  }

  // oh btw, rendering nothing should be ok. not huge break.
  let inst = create(<Surface visitor={visitor} width={2} height={2} />);
  let surface = inst.getInstance();
  inst.update(
    <Surface visitor={visitor} width={2} height={2}>
      <div>
        <span>or like this should just be ignored..</span>
      </div>
    </Surface>
  );
  surface.flush();
  surface.flush();
  surface.redraw();
  surface.flush();

  // useless Bus
  inst.update(
    <Surface visitor={visitor} width={2} height={2}>
      <Bus />
    </Surface>
  );
  surface.redraw();
  surface.flush();

  // empty Bus
  inst.update(
    <Surface visitor={visitor} width={2} height={2}>
      <EmptyBusUsedByANode />
    </Surface>
  );
  surface.redraw();
  surface.flush();

  inst.update(wrap(<JustBlue blue={0} />));
  inst.update(wrap(<JustBlue blue={0} />));
  surface.flush();
  inst.update(wrap(<JustBlue blue={0} />));
  surface.flush();
  inst.update(wrap(<JustBlue blue={0} />));
  surface.flush();
  inst.update(wrap(<JustBlue blue={1} />));
  surface.flush();
  inst.update(wrap(<JustBlue blue={1} />));
  surface.flush();
  inst.update(wrap(<JustBlue blue={0.4} />));
  inst.update(wrap(<JustBlue blue={0.5} />));
  surface.flush();
  invariant(justBlueNode, "justBlueNode is defined");
  expect(justBlueNode.getGLName()).toBeDefined();
  expect(justBlueNode.getGLShortName()).toBeDefined();
  justBlueNode.flush();
  justBlueNode.flush();
  justBlueNode.redraw();
  justBlueNode.flush();
  inst.update(
    wrap(
      <NearestCopy>
        <JustBlue blue={0} />
      </NearestCopy>
    )
  );
  surface.flush();
  inst.update(wrap(<TreeWithZombiesDontBreak />));
  surface.flush();
  inst.update(
    wrap(
      <Node
        shader={shaders.helloTexture2}
        uniforms={{ t2: [white3x3, red2x2] }}
      />
    )
  );
  surface.flush();
  expectToBeCloseToColorArray(
    surface.capture(1, 1).data,
    new Uint8Array([255, 128, 128, 255])
  );
  inst.update(
    wrap(<Node shader={shaders.helloTexture} uniforms={{ t: red2x2 }} />)
  );
  surface.flush();
  expectToBeCloseToColorArray(
    surface.capture(1, 1).data,
    new Uint8Array([255, 0, 0, 255])
  );
  inst.update(wrap(<TreeWithZombiesDontBreak />));
  surface.flush();
  expect(error).toEqual(1);
  inst.update(wrap(<BadNode />));
  surface.flush();
  expect(error).toEqual(2);
  warn = 0;
  inst.update(
    wrap(<Node shader={shaders.helloTexture2} uniforms={{ t2: [white3x3] }} />)
  );
  surface.flush();
  expect(warn).toBeGreaterThan(0);
  warn = 0;
  inst.update(
    wrap(<Node shader={shaders.helloTexture2} uniforms={{ t2: white3x3 }} />)
  );
  surface.flush();
  expect(warn).toBeGreaterThan(0);
  surface.flush();
  warn = 0;
  inst.update(
    wrap(<Node shader={shaders.helloTexture} uniforms={{ t: () => {} }} />)
  );
  surface.flush();
  expect(warn).toBeGreaterThan(0);
  warn = 0;
  inst.update(
    wrap(<Node shader={shaders.helloTexture} uniforms={{ t: { nope: 1 } }} />)
  );
  surface.flush();
  expect(warn).toBeGreaterThan(0);
  warn = 0;
  inst.update(
    wrap(
      <Node
        shader={shaders.helloTexture}
        uniformsOptions={{ t: { interpolation: "nope" } }}
        uniforms={{ t: <JustBlue blue={1} /> }}
      />
    )
  );
  surface.flush();
  expect(warn).toBeGreaterThan(0);
  warn = 0;
  inst.update(
    wrap(
      <Node
        shader={shaders.helloTexture}
        uniformsOptions={{ t: { wrap: "nope" } }}
        uniforms={{ t: <JustBlue blue={1} /> }}
      />
    )
  );
  surface.flush();
  expect(warn).toBeGreaterThan(0);
  warn = 0;
  inst.update(
    wrap(
      <Node
        shader={shaders.helloTexture}
        uniformsOptions={{ t: { wrap: ["nope", "nope"] } }}
        uniforms={{ t: <JustBlue blue={1} /> }}
      />
    )
  );
  surface.flush();
  expect(warn).toBeGreaterThan(0);
  warn = 0;
  inst.update(
    wrap(
      <Node
        blendFunc="nope"
        shader={shaders.helloTexture}
        uniforms={{ t: <JustBlue blue={1} /> }}
      />
    )
  );
  surface.flush();
  expect(warn).toBeGreaterThan(0);
  warn = 0;
  inst.update(
    wrap(
      <Node
        shader={shaders.helloTexture}
        uniforms={{ t: Uniform.Backbuffer }}
      />
    )
  );
  surface.flush();
  expect(warn).toBeGreaterThan(0);
  inst.update(wrap(<MissingOrInvalidUniforms />));
  surface.flush();
  inst.update(wrap(null));
  surface.flush();
  inst.update(wrap(<JustBlue blue={0.5} />));
  surface.flush();
  expectToBeCloseToColorArray(
    surface.capture(1, 1).data,
    new Uint8Array([0, 0, 128, 255])
  );
  class Ex extends React.Component<*> {
    render() {
      return (
        <Surface ref="surface" visitor={visitor} width={2} height={2}>
          <Bus ref="bus">
            <JustBlue blue={0.2} />
          </Bus>
          <LinearCopy>{() => this.refs.bus}</LinearCopy>
        </Surface>
      );
    }
  }
  inst.update(<Ex />);
  expect(inst.getInstance().refs.bus.getGLName()).toBeDefined();
  expect(inst.getInstance().refs.bus.getGLShortName()).toBeDefined();
  inst.getInstance().refs.surface.redraw();
  inst.getInstance().refs.surface.flush();
  inst.unmount();
  inst = create(
    <Surface
      visitor={visitor}
      width={2}
      height={2}
      preload={[null, { invalid: true }]}
    />
  );
  surface = inst.getInstance();
  expect(surface.getGLName()).toBeDefined();
  expect(surface.getGLShortName()).toBeDefined();
  surface.captureAsBlob(); // should not break. but do nothing (in gl-react-headless)
  surface.captureAsDataURL(); // should not break. but do nothing (in gl-react-headless)
  surface.rebootForDebug(); // should not break.
  expect(surface.glIsAvailable()).toEqual(true);
  inst.unmount();
  Visitors.remove(visitor);
  expect(group).toEqual(groupEnd);
  // eslint-disable-next-line no-global-assign
  console = oldConsole;
});
