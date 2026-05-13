import React from "react";
import { Node, Shaders } from "gl-react";
import { Surface } from "gl-react-dom";

const shaders = Shaders.create({
    gradient: {
        frag: `
      precision mediump float;
      uniform float time;
      uniform vec2 resolution;
      uniform vec3 color1;
      uniform vec3 color2;
      
      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        float gradient = sin(uv.x * 3.14159 + time) * 0.5 + 0.5;
        vec3 color = mix(color1, color2, gradient);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    },
    noise: {
        frag: `
      precision mediump float;
      uniform float time;
      uniform vec2 resolution;
      uniform float scale;
      
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }
      
      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        uv *= scale;
        
        float noise = random(floor(uv) + floor(time * 10.0));
        gl_FragColor = vec4(vec3(noise), 1.0);
      }
    `,
    },
    wave: {
        frag: `
      precision mediump float;
      uniform float time;
      uniform vec2 resolution;
      uniform float frequency;
      uniform float amplitude;
      
      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        float wave = sin(uv.x * frequency + time) * amplitude;
        float y = uv.y + wave * 0.1;
        
        vec3 color = vec3(0.2, 0.4, 0.8);
        if (abs(y - 0.5) < 0.02) {
          color = vec3(1.0, 1.0, 1.0);
        }
        
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    },
});

interface AdvancedWebGLExampleProps {
    width?: number;
    height?: number;
    shaderType?: "gradient" | "noise" | "wave";
    time?: number;
}

export function AdvancedWebGLExample({
    width = 300,
    height = 300,
    shaderType = "gradient",
    time = 0
}: AdvancedWebGLExampleProps) {
    const getUniforms = () => {
        switch (shaderType) {
            case "gradient":
                return {
                    time,
                    resolution: [width, height],
                    color1: [0.2, 0.4, 0.8],
                    color2: [0.8, 0.2, 0.4],
                };
            case "noise":
                return {
                    time,
                    resolution: [width, height],
                    scale: 10.0,
                };
            case "wave":
                return {
                    time,
                    resolution: [width, height],
                    frequency: 8.0,
                    amplitude: 0.3,
                };
            default:
                return { time, resolution: [width, height] };
        }
    };

    return (
        <Surface width={width} height={height}>
            <Node
                shader={shaders[shaderType]}
                uniforms={getUniforms()}
            />
        </Surface>
    );
}

export function AnimatedAdvancedWebGLExample({
    width = 300,
    height = 300,
    shaderType = "gradient"
}: {
    width?: number;
    height?: number;
    shaderType?: "gradient" | "noise" | "wave";
}) {
    const [time, setTime] = React.useState(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setTime((t) => t + 0.016);
        }, 16);
        return () => clearInterval(interval);
    }, []);

    return (
        <AdvancedWebGLExample
            width={width}
            height={height}
            shaderType={shaderType}
            time={time}
        />
    );
}


