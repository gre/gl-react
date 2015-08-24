const invariant = require("invariant");
const React = require("react");
const {
  Component,
  PropTypes
} = React;
const createShader = require("gl-shader");
const createTexture = require("gl-texture2d");
const Shaders = require("./Shaders");
const GLImage = require("./GLImage");
const vertShader = require("./static.vert");

function sameUniforms (uniforms, prev) {
  return uniforms === prev; // this is enough for now, we can improve if need
}

// TODO: this does not yet implement multi-pass

class GLCanvas extends Component {

  constructor (props) {
    super(props);
    this.state = {
      scale: window.devicePixelRatio
    };
    this.handleDraw = this.handleDraw.bind(this);

    this._images = {};
  }

  render () {
    const { width, height } = this.props;
    const { devicePixelRatio } = this.state;
    const styles = {
      width: width+"px",
      height: height+"px"
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

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

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

    this.syncBlendMode(this.props);
    this.syncShader(this.props.data);
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
    const devicePixelRatio = window.devicePixelRatio;
    if (this.state.devicePixelRatio !== devicePixelRatio) {
      this.setState({ devicePixelRatio });
    }
    if (props.opaque !== this.props.opaque)
      this.syncBlendMode(props);

    if (props.data.shader !== this.props.data.shader)
      this.syncShader(props.data);
    else { // syncShader will call other syncs so we can save some calls
      if (!sameUniforms(props.data.uniforms, this.props.data.uniforms))
        this.syncUniforms(props.data);
    }
  }

  componentDidUpdate (prevProps, prevState) {
    const gl = this.gl;
    if (!gl) return;
    const { width, height } = this.props;
    const { devicePixelRatio } = this.state;
    if (prevProps.width !== width || prevProps.height !== height || prevState.devicePixelRatio !== devicePixelRatio) {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }
  }

  getDrawingTarget (i) {
    return React.findDOMNode(this.refs.render).parentNode.children[i].firstChild;
  }

  syncBlendMode (props) {
    const gl = this.gl;
    if (!gl) return;
    if (props.opaque) {
      gl.disable(gl.BLEND);
    }
    else {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }
  }

  syncShader (props) {
    const gl = this.gl;
    if (!gl) return;
    const { shader: shaderId } = props;
    const shaderObj = Shaders.get(shaderId);
    invariant(shaderObj, "Shader #%s does not exists", shaderId);
    let shader = this.shader;
    if (!shader) {
      shader = createShader(gl, vertShader, shaderObj.frag);
      this.shader = shader;
    }
    else {
      shader.update(vertShader, shaderObj.frag);
    }
    shader.bind();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    shader.attributes._p.pointer();

    for (const t in this._textures) {
      this._textures[t].dispose();
    }
    const textureUnits = {};
    const textures = {};
    let unit = 0;
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

    this.syncTargetUniforms(props);
    this.syncUniforms(props);
    this.requestDraw();
  }

  syncTextureImage (texture, image) {
    if (texture._glImage !== image.image) {
      texture._glImage = image.image;
      if (image.image) {
        texture.shape = [ image.image.width, image.image.height ];
        texture.setPixels(image.image);
      }
      else {
        texture.shape = [ 2, 2 ];
      }
    }
  }

  syncUniforms ({ uniforms }) {
    const shader = this.shader;
    if (!shader) return;
    const currentResources = [];
    for (const uniformName in uniforms) {
      const texture = this._textures[uniformName];
      const value = uniforms[uniformName];
      if (texture) {
        switch (value.type) {

        case "image":
          const val = value.value;
          const src = val.uri;
          invariant(src && typeof src === "string", "An image src is defined for uniform '%s'", uniformName);
          const textureUnit = this._textureUnits[uniformName];
          let image = this._images[src];
          if (!image) {
            image = new GLImage(() => {
              this.syncUniforms(this.props.data);
            });
            this._images[src] = image;
          }
          image.src = src;
          currentResources.push(src);
          this.syncTextureImage(texture, image);
          shader.uniforms[uniformName] = textureUnit;
          break;

        }
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

  syncTargetUniforms ({ uniforms }) {
    const shader = this.shader;
    if (!shader) return;

    let needRedraw = false;
    for (const uniformName in uniforms) {
      const texture = this._textures[uniformName];
      const value = uniforms[uniformName];
      if (texture) {
        switch (value.type) {
        case "target":
          needRedraw = true;
          const textureUnit = this._textureUnits[uniformName];
          const target = this.getDrawingTarget(value.id);
          const width = target.width || target.videoWidth;
          const height = target.height || target.videoHeight;
          if (width && height) { // ensure the resource is loaded
            texture.shape = [ width, height ];
            texture.setPixels(target);
            shader.uniforms[uniformName] = textureUnit;
          }
          else {
            texture.shape = [ 2, 2 ];
          }
          break;
        }
      }
    }
    if (needRedraw) this.requestDraw();
  }

  requestDraw () {
    if (this._needsDraw) return;
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
    const props = this.props;

    this.syncTargetUniforms(props.data);

    // Bind the textures
    for (const uniformName in this._textures) {
      this._textures[uniformName].bind(this._textureUnits[uniformName]);
    }
    // Render
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}

GLCanvas.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  data: PropTypes.object.isRequired
};

module.exports = GLCanvas;
