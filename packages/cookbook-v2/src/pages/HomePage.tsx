import { Link } from "react-router-dom";
import { CodeBracketIcon } from "@heroicons/react/24/outline";
import { Surface } from "gl-react-dom";
import { Node, Shaders, GLSL, Uniform, LinearCopy } from "gl-react";
import Prism from "prismjs";
import "prismjs/components/prism-jsx";
import { useTimeLoop } from "../hooks/useTimeLoop";

const shaders = Shaders.create({
  MotionBlur: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D children, backbuffer;
uniform float persistence;
void main () {
  gl_FragColor = vec4(mix(
    texture2D(children, uv),
    texture2D(backbuffer, uv),
    persistence
  ).rgb, 1.0);
}`,
  },
  HelloGL: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform float red;
void main() {
  gl_FragColor = vec4(red, uv.x, uv.y, 1.0);
}`,
  },
  Rotate: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform float angle, scale;
uniform sampler2D children;
void main() {
  mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  vec2 p = (uv - vec2(0.5)) * rotation / scale + vec2(0.5);
  gl_FragColor =
    p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0
    ? vec4(0.067, 0.094, 0.153, 1.0)
    : texture2D(children, p);
}`,
  },
});

function MotionBlur({
  children,
  persistence,
}: {
  children: any;
  persistence: number;
}) {
  return (
    <Node
      shader={shaders.MotionBlur}
      backbuffering
      clear={{ color: [0.067, 0.094, 0.153, 1] }}
      uniforms={{ children, backbuffer: Uniform.Backbuffer, persistence }}
    />
  );
}

function HelloGL({ red }: { red: number }) {
  return <Node shader={shaders.HelloGL} uniforms={{ red }} />;
}

function Rotate({
  children,
  scale,
  angle,
}: {
  children: any;
  scale: number;
  angle: number;
}) {
  return (
    <Node shader={shaders.Rotate} uniforms={{ scale, angle, children }} />
  );
}

function LiveCode({
  persistence,
  scale,
  angle,
  red,
}: {
  persistence: number;
  scale: number;
  angle: number;
  red: number;
}) {
  const code = `<Surface width={200} height={200}>
  <MotionBlur persistence={${persistence.toFixed(2)}}>
    <Rotate scale={${scale.toFixed(2)}} angle={${angle.toFixed(2)}}>
      <HelloGL red={${red.toFixed(2)}} />
    </Rotate>
  </MotionBlur>
</Surface>`;

  const html = Prism.highlight(code, Prism.languages.jsx, "jsx");

  return (
    <pre className="bg-gray-900 rounded-lg p-4 text-sm font-mono leading-relaxed overflow-hidden h-[200px] flex items-center">
      <code dangerouslySetInnerHTML={{ __html: html }} />
    </pre>
  );
}

function HeroDemo() {
  const { time } = useTimeLoop();
  const t = time / 1000;
  const persistence = 0.75 - 0.2 * Math.cos(0.5 * t);
  const red = 0.6 + 0.4 * Math.cos(4 * t);
  const scale = 0.7 + 0.4 * Math.cos(t);
  const angle = 2 * Math.PI * (0.5 + 0.5 * Math.cos(t));

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
      <div className="relative shrink-0">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg blur opacity-25" />
        <div className="relative rounded-lg shadow-lg overflow-hidden leading-[0]" style={{ backgroundColor: "#111827" }}>
          <Surface width={200} height={200}>
            <LinearCopy>
              <MotionBlur persistence={persistence}>
                <Rotate scale={scale} angle={angle}>
                  <HelloGL red={red} />
                </Rotate>
              </MotionBlur>
            </LinearCopy>
          </Surface>
        </div>
      </div>
      <div className="min-w-0">
        <LiveCode
          persistence={persistence}
          scale={scale}
          angle={angle}
          red={red}
        />
      </div>
    </div>
  );
}

export function HomePage() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl flex items-center justify-center gap-2">
          <CodeBracketIcon className="h-8 w-8 sm:h-10 sm:w-10 text-primary-600" />
          gl-react
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          A{" "}
          <a
            href="https://react.dev"
            className="text-primary-600 hover:underline"
          >
            React
          </a>{" "}
          library to write and compose WebGL shaders.
        </p>
      </div>

      <div className="flex items-center justify-center gap-x-4">
        <Link to="/examples" className="btn btn-primary text-lg px-8 py-3">
          Explore Examples
        </Link>
        <a
          href="https://github.com/gre/gl-react"
          className="btn text-lg px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          GitHub
        </a>
      </div>

      <HeroDemo />
    </div>
  );
}
