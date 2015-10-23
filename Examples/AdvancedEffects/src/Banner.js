const React = require("react");
const GL = require("gl-react-core");
const { Surface } = require("gl-react");

const shaders = GL.Shaders.create({
  banner: {
    frag: `
precision highp float;
varying vec2 uv;
uniform float time;
void main( void ) {
	float color = 0.0;
	color += sin( uv.x * cos( time / 15.0 ) * 80.0 ) + cos( uv.y * cos( time / 15.0 ) * 10.0 );
	color += sin( uv.y * sin( time / 10.0 ) * 40.0 ) + cos( uv.x * sin( time / 25.0 ) * 40.0 );
	color += sin( uv.x * sin( time / 5.0 ) * 10.0 ) + sin( uv.y * sin( time / 35.0 ) * 80.0 );
	color *= sin( time / 10.0 );
	gl_FragColor = vec4(
    smoothstep(0.8, 1.6, color),
    smoothstep(0.1, 0.3, color),
    smoothstep(1.0, 0.2, color) - smoothstep(0.1, 0.0, color),
    color
  ) * (pow(uv.y, 0.8));
}
`
  }
});

class Banner extends React.Component {
  render () {
    const { width, height, time } = this.props;
    return <Surface width={width} height={height} opaque={false}>
      <GL.Node
        shader={shaders.banner}
        uniforms={{ time: time }}
      />
    </Surface>;
  }
}

module.exports = Banner;
