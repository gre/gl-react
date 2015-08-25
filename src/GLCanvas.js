const invariant = require("invariant");
const React = require("react");
const {
  Component,
  PropTypes
} = React;
const createShader = require("gl-shader");
const createTexture = require("gl-texture2d");
const createFBO = require("gl-fbo");
const Shaders = require("./Shaders");
const GLImage = require("./GLImage");
const vertShader = require("./static.vert");

function diffDispose (newMap, oldMap) {
  for (const o in oldMap) {
    if (!(o in newMap)) {
      oldMap[o].dispose();
    }
  }
}

function syncShape (obj, shape) {
  if (obj.shape[0] !== shape[0] || obj.shape[1] !== shape[1]) {
    obj.shape = shape;
  }
}

class GLCanvas extends Component {

  constructor (props) {
    super(props);
    this.state = {
      scale: window.devicePixelRatio
    };
    this.handleDraw = this.handleDraw.bind(this);
    this.handleSyncData = this.handleSyncData.bind(this);
    this.onImageLoad = this.onImageLoad.bind(this);

    this._images = {};
    this._shaders = {};
    this._fbos = {};
    this._targetTextures = [];
  }

  render () {
    const { width, height } = this.props;
    const { scale } = this.state;
    const styles = {
      width: width+"px",
      height: height+"px"
    };
    return <canvas
      {...this.props}
      ref="render"
      style={styles}
      width={width * scale}
      height={height * scale}
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
    this._buffer = buffer;

    this.resizeTargetTextures(this.props.nbTargets);
    this.syncBlendMode(this.props);
    this.syncData(this.props.data);
  }

  componentWillUnmount () {
    this._targetTextures.forEach(t => t.dispose());
    [
      this._shaders,
      this._images,
      this._fbos
    ].forEach(coll => {
      for (const k in coll) {
        coll[k].dispose();
        delete coll[k];
      }
    });
    if (this.gl) this.gl.deleteBuffer(this._buffer);
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
    if (props.nbTargets !== this.props.nbTargets)
      this.resizeTargetTextures(props.nbTargets);
  }

  componentDidUpdate () {
    const gl = this.gl;
    if (!gl) return;
    const { data } = this.props;
    this.syncData(data);
  }

  draw () {
    const gl = this.gl;
    const renderData = this._renderData;
    if (!gl || !renderData) return;
    const {scale} = this.state;
    const fbos = this._fbos;
    const buffer = this._buffer;

    function recDraw (renderData) {
      const { shader, uniforms, textures, children, width, height, frameIndex } = renderData;

      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const fbo = fbos[child.frameIndex];
        syncShape(fbo, [ child.width * scale, child.height * scale ]);
        fbo.bind();
        recDraw(child);
      }

      if (frameIndex === -1) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }
      else {
        fbos[frameIndex].bind();
      }

      gl.viewport(0, 0, width * scale, height * scale);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      shader.bind();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

      // Bind the textures
      for (const uniformName in textures) {
        textures[uniformName].bind(uniforms[uniformName]);
      }

      // Set the uniforms
      for (const uniformName in uniforms) {
        shader.uniforms[uniformName] = uniforms[uniformName];
      }

      // Render
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    this.syncTargetTextures();

    recDraw(renderData);
  }

  syncData (data) {
    this._needsSyncData = false;
    const gl = this.gl;
    if (!gl) return;
    const { scale } = this.state;

    const onImageLoad = this.onImageLoad;
    const targetTextures = this._targetTextures;
    const prevShaders = this._shaders;
    const prevImages = this._images;
    const prevFbos = this._fbos;

    const shaders = {};
    const images = {};
    const fbos = {};

    function traverseTree (data, frameIndex) {
      const { shader: s, uniforms: dataUniforms, children: dataChildren, width, height } = data;

      const children = [];
      const fbosMapping = {};
      let fboId = 0;
      for (let i = 0; i < dataChildren.length; i++) {
        const child = dataChildren[i];
        if (fboId === frameIndex) fboId ++;
        fbosMapping[i] = fboId;
        children.push(traverseTree(child, fboId));
        fboId ++;
      }

      // Handle shader sync
      let shader;
      if (prevShaders[s]) {
        shader = prevShaders[s];
      }
      else {
        const shaderObj = Shaders.get(s);
        invariant(shaderObj, "Shader #%s does not exists", s);
        shader = createShader(gl, vertShader, shaderObj.frag);
        shader.name = shaderObj.name;
        shader.bind();
        shader.attributes._p.pointer();
      }
      shaders[s] = shader;

      // Handle uniforms sync
      let uniforms = {};
      let textures = {};
      let units = 0;
      for (const uniformName in dataUniforms) {
        const value = dataUniforms[uniformName];
        const type = shader.types.uniforms[uniformName];
        invariant(type, "Shader '%s': Uniform '%s' is not defined/used", shader.name, uniformName);
        if (value && (type === "sampler2D" || type === "samplerCube")) {
          uniforms[uniformName] = units ++;
          switch (value.type) {
          case "target":
            textures[uniformName] = targetTextures[value.id];
            break;

          case "framebuffer":
            const id = fbosMapping[value.id];
            let fbo;
            if (prevFbos[id]) {
              fbo = prevFbos[id];
              syncShape(fbo, [ width * scale, height * scale ]);
            }
            else {
              fbo = createFBO(gl, [ scale * width, scale * height ]);
            }
            fbos[id] = fbo;
            textures[uniformName] = fbo.color[0];
            break;

          case "image":
            const val = value.value;
            const src = val.uri;
            invariant(src && typeof src === "string", "Shader '%s': An image src is defined for uniform '%s'", shader.name, uniformName);
            let image;
            if (prevImages[src]) {
              image = prevImages[src];
            }
            else {
              image = new GLImage(gl, onImageLoad);
            }
            images[src] = image;
            image.src = src;
            textures[uniformName] = image.getTexture();
            break;

          default:
            invariant(false, "Shader '%s': invalid uniform value of type '%s'", shader.name, value.type);
          }
        }
        else {
          uniforms[uniformName] = value;
        }
      }

      const notProvided = Object.keys(shader.uniforms).filter(u => !(u in uniforms));
      invariant(notProvided.length===0, "Shader '%s': All defined uniforms must be provided. Missing: '"+notProvided.join("', '")+"'", shader.name);

      return { shader, uniforms, textures, children, width, height, frameIndex };
    }

    this._renderData = traverseTree(data, -1);

    diffDispose(shaders, prevShaders);
    diffDispose(fbos, prevFbos);
    diffDispose(images, prevImages);

    this._shaders = shaders;
    this._fbos = fbos;
    this._images = images;

    this.requestDraw();
  }

  onImageLoad () {
    this.requestSyncData();
  }

  resizeTargetTextures (size) {
    const n = size + 1;
    const gl = this.gl;
    const targetTextures = this._targetTextures;
    const length = targetTextures.length;
    if (length === n) return;
    if (n < length) {
      for (let i = n; i < length; i++) {
        targetTextures[i].dispose();
      }
      targetTextures.length = n;
    }
    else {
      for (let i = targetTextures.length; i < n; i++) {
        const texture = createTexture(gl, [ 2, 2 ]);
        texture.minFilter = texture.magFilter = gl.LINEAR;
        targetTextures.push(texture);
      }
    }
  }

  syncTargetTextures () {
    const targets = this.getDrawingTargets();
    const targetTextures = this._targetTextures;
    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];
      this.syncTargetTexture(targetTextures[i], target);
    }
  }

  syncTargetTexture (texture, target) {
    const width = target.width || target.videoWidth;
    const height = target.height || target.videoHeight;
    if (width && height) { // ensure the resource is loaded
      syncShape(texture, [ width, height ]);
      texture.setPixels(target);
    }
    else {
      texture.shape = [ 2, 2 ];
    }
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

  getDrawingTargets () {
    const {nbTargets} = this.props;
    if (nbTargets === 0) return [];
    const children = React.findDOMNode(this.refs.render).parentNode.children;
    const all = [];
    for (var i = 0; i < nbTargets; i++) {
      all[i] = children[i].firstChild;
    }
    return all;
  }

  requestSyncData () {
    if (this._needsSyncData) return;
    this._needsSyncData = true;
    requestAnimationFrame(this.handleSyncData);
  }

  handleSyncData () {
    if (!this._needsSyncData) return;
    this.syncData(this.props.data);
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
}

GLCanvas.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  data: PropTypes.object.isRequired,
  nbTargets: PropTypes.number.isRequired
};

module.exports = GLCanvas;
