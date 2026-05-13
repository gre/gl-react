import React from "react";
import { Node, Shaders } from "gl-react";
import { Surface } from "gl-react-dom";

const shaders = Shaders.create({
    hello: {
        frag: `
      precision mediump float;
      uniform float time;
      uniform vec2 resolution;
      
      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec3 color = 0.5 + 0.5 * cos(time + uv.xyx + vec3(0, 2, 4));
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    },
});

interface WebGLExampleProps {
    width?: number;
    height?: number;
    time?: number;
}

export function WebGLExample({ width = 300, height = 300, time = 0 }: WebGLExampleProps) {
    return (
        <Surface width={width} height={height}>
            <Node
                shader={shaders.hello}
                uniforms={{
                    time,
                    resolution: [width, height],
                }}
            />
        </Surface>
    );
}

export function AnimatedWebGLExample({ width = 300, height = 300 }: { width?: number; height?: number }) {
    const [time, setTime] = React.useState(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setTime((t) => t + 0.016); // ~60fps
        }, 16);
        return () => clearInterval(interval);
    }, []);

    return <WebGLExample width={width} height={height} time={time} />;
}


