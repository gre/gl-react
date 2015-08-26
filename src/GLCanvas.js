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

// .dispose() all objects that have disappeared from oldMap to newMap
function diffDispose (newMap, oldMap) {
  for (const o in oldMap) {
    if (!(o in newMap)) {
      oldMap[o].dispose();
    }
  }
}

// set obj.shape only if it has changed
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
    const { width, height, style } = this.props;
    const { scale } = this.state;
    const styles = {
      ...style,
      width: width+"px",
      height: height+"px"
    };
    return <canvas
      {...this.props}
      data={undefined}
      ref="render"
      style={styles}
      width={width * scale}
      height={height * scale}
    />;
  }

  componentDidMount () {
    // Create the WebGL Context and init the rendering
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
    // Destroy everything to avoid leaks.
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
    // react on props changes only for things we can't pre-compute
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
    // Synchronize the rendering (after render is done)
    const { data } = this.props;
    this.syncData(data);
  }

  syncData (data) {
    // Synchronize the data props that contains every data needed for render
    const gl = this.gl;
    if (!gl) return;

    const onImageLoad = this.onImageLoad;
    const targetTextures = this._targetTextures;

    // old values
    const prevShaders = this._shaders;
    const prevImages = this._images;
    const prevFbos = this._fbos; // FBO is short for "framebuffer object"

    // new values (mutated from traverseTree)
    const shaders = {}; // shaders cache (per Shader ID)
    const images = {}; // images cache (per src)
    const fbos = {}; // pool of FBOs (the size is determined by the pass children max length)

    // traverseTree compute renderData from the data.
    // frameIndex is the framebuffer index of a node. (root is -1)
    function traverseTree (data, frameIndex) {
      const { shader: s, uniforms: dataUniforms, children: dataChildren, width, height } = data;

      // Traverse children and compute children renderData.
      // We build a framebuffer mapping (from child index to fbo index)
      const children = [];
      const fbosMapping = {};
      let fboId = 0;
      for (let i = 0; i < dataChildren.length; i++) {
        const child = dataChildren[i];
        if (fboId === frameIndex) fboId ++; // ensures a child DO NOT use the same framebuffer of its parent. (skip if same)
        fbosMapping[i] = fboId;
        children.push(traverseTree(child, fboId));
        fboId ++;
      }

      // Sync shader
      let shader;
      if (s in shaders) {
        shader = shaders[s]; // re-use existing gl-shader instance
      }
      else if (s in prevShaders) {
        shader = shaders[s] = prevShaders[s]; // re-use old gl-shader instance
      }
      else {
        // Retrieve/Compiles/Prepare the shader
        const shaderObj = Shaders.get(s);
        invariant(shaderObj, "Shader #%s does not exists", s);
        shader = createShader(gl, vertShader, shaderObj.frag);
        shader.name = shaderObj.name;
        shader.attributes._p.pointer();
        shaders[s] = shader;
      }

      // extract uniforms and textures
      let uniforms = {}; // will contains all uniforms values (including texture units)
      let textures = {}; // a texture is an object with a bind() function
      let units = 0; // Starting from 0, we will affect texture units to texture uniforms
      for (const uniformName in dataUniforms) {
        const value = dataUniforms[uniformName];
        const type = shader.types.uniforms[uniformName];

        invariant(type, "Shader '%s': Uniform '%s' is not defined/used", shader.name, uniformName);

        if (value && (type === "sampler2D" || type === "samplerCube")) {
          // This is a texture (with a value)
          uniforms[uniformName] = units ++; // affect a texture unit
          switch (value.type) {
          case "target": // targets are DOM elements that can be rendered as texture (<canvas>, <img>, <video>)
            textures[uniformName] = targetTextures[value.id];
            break;

          case "framebuffer": // framebuffers are a children rendering
            const id = fbosMapping[value.id]; // value.id is child index, we obtain the fbo index (via fbosMapping)
            let fbo;
            if (id in fbos) {
              fbo = fbos[id]; // re-use existing FBO from pool
            }
            else if (id in prevFbos) {
              fbo = fbos[id] = prevFbos[id]; // re-use old FBO
            }
            else {
              // need one more FBO
              fbo = createFBO(gl, [ 2, 2 ]);
              fbo.minFilter = fbo.magFilter = gl.LINEAR;
              fbos[id] = fbo;
            }
            textures[uniformName] = fbo.color[0];
            break;

          case "image":
            const val = value.value;
            const src = val.uri;
            invariant(src && typeof src === "string", "Shader '%s': An image src is defined for uniform '%s'", shader.name, uniformName);
            let image;
            if (src in images) {
              image = images[src];
            }
            else if (src in prevImages) {
              image = images[src] = prevImages[src];
            }
            else {
              image = new GLImage(gl, onImageLoad);
              images[src] = image;
            }
            image.src = src; // Always set the image src. GLImage internally won't do anything if it doesn't change
            textures[uniformName] = image.getTexture(); // GLImage will compute and cache a gl-texture2d instance
            break;

          default:
            invariant(false, "Shader '%s': invalid uniform '%s' value of type '%s'", shader.name, uniformName, value.type);
          }
        }
        else {
          // In all other cases, we just copy the uniform value
          uniforms[uniformName] = value;
        }
      }

      const notProvided = Object.keys(shader.uniforms).filter(u => !(u in uniforms));
      invariant(notProvided.length===0, "Shader '%s': All defined uniforms must be provided. Missing: '"+notProvided.join("', '")+"'", shader.name);

      return { shader, uniforms, textures, children, width, height, frameIndex };
    }

    this._renderData = traverseTree(data, -1);

    // Destroy previous states that have disappeared
    diffDispose(shaders, prevShaders);
    diffDispose(fbos, prevFbos);
    diffDispose(images, prevImages);

    this._shaders = shaders;
    this._fbos = fbos;
    this._images = images;

    this._needsSyncData = false;
    this.requestDraw();
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

      const w = width * scale, h = height * scale;

      // children are rendered BEFORE the parent
      children.forEach(recDraw);

      if (frameIndex === -1) {
        // special case for root FBO
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, w, h);
      }
      else {
        // Use the framebuffer of the node (determined by syncData)
        const fbo = fbos[frameIndex];
        syncShape(fbo, [ w, h ]);
        fbo.bind();
      }

      // Prepare the viewport
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Prepare the shader/buffer
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

    // Draw the target to targetTextures (assuming they ALWAYS change and need a re-draw)
    this.syncTargetTextures();

    // Draw everything
    recDraw(renderData);
  }

  onImageLoad () {
    // Any texture image load will trigger a future re-sync of data
    this.requestSyncData();
  }

  // Resize the pool of textures for the targetTextures
  resizeTargetTextures (n) {
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

  // Draw the targetTextures
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
