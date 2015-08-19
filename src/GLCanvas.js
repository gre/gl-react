const invariant = require("invariant");
const React = require("react");
const {
  Component
} = React;
const createShader = require("gl-shader");
const createTexture = require("gl-texture2d");
const Shaders = require("./Shaders");
const GLImage = require("./GLImage");
const vertShader = require("./static.vert");

class GLCanvas extends Component {
  constructor (props) {
    super(props);
    this.handleDraw = this.handleDraw.bind(this);

    this._images = {};
  }
  render () {
    const { width, height, style } = this.props;
    const devicePixelRatio = window.devicePixelRatio;
    const styles = {
      width: width+"px",
      height: height+"px",
      ...style
    };
    return <canvas
      {...this.props}
      ref="render"
      style={styles}
      width={width * devicePixelRatio}
      height={height * devicePixelRatio}
    />;
  }
  componentDidMount () {
    const canvas = React.findDOMNode(this.refs.render);
    const opts = {};
    const gl = (
      canvas.getContext("webgl", opts) ||
      canvas.getContext("webgl-experimental", opts) ||
      canvas.getContext("experimental-webgl", opts)
    );
    if (!gl) return;
    this.gl = gl;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1.0, -1.0,
      1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
      1.0, -1.0,
      1.0,  1.0
    ]), gl.STATIC_DRAW);
    this.buffer = buffer;

    this.syncShader(this.props);
  }
  componentWillUnmount () {
    if (this.shader) this.shader.dispose();
    if (this.gl) {
      this.gl.deleteBuffer(this.buffer);
    }
    this.shader = null;
    this.gl = null;
  }
  componentWillReceiveProps (props) {
    if (props.shader !== this.props.shader)
      this.syncShader(props);
    if (props.uniforms !== this.props.uniforms)
      this.syncUniforms(props);
  }
  syncShader (props) {
    const gl = this.gl;
    if (!gl) return;
    const { shader: shaderId } = props;
    const shaderObj = Shaders.get(shaderId);
    let shader = this.shader;
    if (!shader) {
      shader = createShader(gl, vertShader, shaderObj.frag);
      this.shader = shader;
    }
    else {
      shader.update(vertShader, shaderObj.frag);
    }
    let unit = 0;
    for (const t in this._textures) {
      this._textures[t].dispose();
    }
    const textureUnits = {};
    const textures = {};
    for (const uniformName in shader.types.uniforms) {
      const type = shader.types.uniforms[uniformName];
      if (type === "sampler2D" || type === "samplerCube") {
        const texture = createTexture(gl, [ 2, 2 ]);
        texture.minFilter = texture.magFilter = gl.LINEAR;
        textures[uniformName] = texture;
        textureUnits[uniformName] = unit ++;
      }
    }
    this._textureUnits = textureUnits;
    this._textures = textures;

    this.syncUniforms(props);
    this.requestDraw();
  }
  syncUniforms ({ uniforms }) {
    const gl = this.gl;
    const shader = this.shader;
    if (!shader) return;
    shader.bind();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    const currentResources = [];
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    for (const uniformName in uniforms) {
      const texture = this._textures[uniformName];
      const value = uniforms[uniformName];
      if (texture) {
        const src = value;
        const textureUnit = this._textureUnits[uniformName];
        let image = this._images[src];
        if (!image) {
          image = new GLImage(() => {
            this.requestDraw();
          });
          this._images[src] = image;
        }
        image.src = src;
        currentResources.push(src);
        if (image.image) {
          texture.shape = [ image.image.width, image.image.height ];
          texture.setPixels(image.image);
        }
        else {
          //texture.shape = [ 2, 2 ];
        }

        shader.uniforms[uniformName] = texture.bind(textureUnit);
      }
      else {
        shader.uniforms[uniformName] = value;
      }
    }
    for (const src in this._images) {
      if (currentResources.indexOf(src) === -1) {
        this._images[src].dispose();
        delete this._images[src];
      }
    }
    this.requestDraw();
  }

  requestDraw () {
    this._needsDraw = true;
    requestAnimationFrame(this.handleDraw);
  }
  handleDraw () {
    if (!this._needsDraw) return;
    this._needsDraw = false;
    this.draw();
  }
  draw () {
    const gl = this.gl;
    const shader = this.shader;
    if (!shader) return;
    const { targetUniforms, getDrawingTarget } = this.props;
    shader.bind();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    shader.attributes.position.pointer();

    if (targetUniforms) {
      targetUniforms.forEach(uniformName => {
        const texture = this._textures[uniformName];
        invariant(texture, "Uniform '%s' described by GL.Target is not a texture.", uniformName);
        const textureUnit = this._textureUnits[uniformName];
        const target = getDrawingTarget(uniformName);
        invariant(target && target.width && target.height, "GL.Target only support one child among: <canvas>, <img> or <video>.");
        texture.shape = [ target.width, target.height ];
        texture.setPixels(target);
        shader.uniforms[uniformName] = texture.bind(textureUnit);
      });
    }

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}

module.exports = GLCanvas;
