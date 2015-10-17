const invariant = require("invariant");
const React = require("react");
const {
  Component,
  PropTypes
} = React;
const raf = require("raf");
const now = require("performance-now");
const createShader = require("gl-shader");
const createTexture = require("gl-texture2d");
const createFBO = require("gl-fbo");
const pool = require("typedarray-pool");
const Shaders = require("./Shaders");
const GLImage = require("./GLImage");
const vertShader = require("./static.vert");
const pointerEventsProperty = require("./pointerEventsProperty");

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

function imageObjectToId (image) {
  return image.uri;
}

function countPreloaded (loaded, toLoad) {
  let nb = 0;
  for (let i=0; i < toLoad.length; i++) {
    if (loaded.indexOf(imageObjectToId(toLoad[i]))!==-1)
      nb ++;
  }
  return nb;
}

function extractShaderDebug (shader) {
  const { types: { uniforms } } = shader;
  return { types: { uniforms } };
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
    this.getFBO = this.getFBO.bind(this);

    this._images = {};
    this._shaders = {};
    this._fbos = {};
    this._contentTextures = [];
    this._standaloneTextures = [];
    if (props.imagesToPreload.length > 0) {
      this._preloading = [];
    }
    else {
      this._preloading = null;
      if (this.props.onLoad) this.props.onLoad();
    }
    this._autoredraw = this.props.autoRedraw;

    this._captureListeners = [];
  }

  captureFrame (cb) {
    this._captureListeners.push(cb);
    this.requestDraw();
  }

  setDebugProbe (params) {
    // Free old
    if (this._debugProbe) {
      this._debugProbe = null;
    }
    if (params) {
      invariant(typeof params.onDraw === "function", "onDraw is required in setDebugProbe({ onDraw })");
      params = {
        profile: true,
        capture: true,
        captureRate: 0, // in ms. This can be use to throttle the capture. Careful however, you might not get the latest capture in cases where autoRedraw is not used. '0' default value means no throttle.
        // extends defaults with argument
        ...params
      };
      this._debugProbe = {
        ...params,
        lastCapture: 0
      };
      this.requestDraw();
    }
  }

  render () {
    const { width, height,
      data, nbContentTextures, imagesToPreload, renderId, opaque, onLoad, onProgress, autoRedraw, eventsThrough, visibleContent, // eslint-disable-line
      ...rest
    } = this.props;
    const { scale } = this.state;
    const styles = {
      width: width+"px",
      height: height+"px",
      [pointerEventsProperty]: eventsThrough ? "none" : "auto",
      position: "relative",
      background: opaque ? "#000" : "transparent"
    };
    return <canvas
      {...rest} // eslint-disable-line
      ref="render"
      style={styles}
      width={width * scale}
      height={height * scale}
    />;
  }

  componentDidMount () {
    // Create the WebGL Context and init the rendering
    const canvas = React.findDOMNode(this.refs.render);
    this.canvas = canvas;
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

    this.resizeUniformContentTextures(this.props.nbContentTextures);
    this.syncData(this.props.data);

    this.checkAutoRedraw();
  }

  componentWillUnmount () {
    // Destroy everything to avoid leaks.
    this._contentTextures.forEach(t => t.dispose());
    this._standaloneTextures.forEach(t => t.dispose());
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
    if (this.allocatedFromPool) {
      this.allocatedFromPool.forEach(pool.freeUint8);
    }
    this.setDebugProbe(null);
    if (this.gl) this.gl.deleteBuffer(this._buffer);
    this.shader = null;
    this.gl = null;
    if (this._raf) raf.cancel(this._raf);
  }

  componentWillReceiveProps (props) {
    // react on props changes only for things we can't pre-compute
    const devicePixelRatio = window.devicePixelRatio;
    if (this.state.devicePixelRatio !== devicePixelRatio) {
      this.setState({ devicePixelRatio });
    }
    if (props.nbContentTextures !== this.props.nbContentTextures)
      this.resizeUniformContentTextures(props.nbContentTextures);

    this._autoredraw = props.autoRedraw;
    this.checkAutoRedraw();
  }

  componentDidUpdate () {
    // Synchronize the rendering (after render is done)
    const { data } = this.props;
    this.syncData(data);
  }

  checkAutoRedraw () {
    if (!this._autoredraw || this._raf) return;
    const loop = () => {
      if (!this._autoredraw) {
        delete this._raf;
        return;
      }
      this._raf = raf(loop);
      this.draw();
    };
    this._raf = raf(loop);
  }

  getFBO (id) {
    const fbos = this._fbos; // pool of FBOs
    invariant(id>=0, "fbo id must be a positive integer");
    if (id in fbos) {
      return fbos[id]; // re-use existing FBO from pool
    }
    else {
      const fbo = createFBO(this.gl, [ 2, 2 ]);
      fbos[id] = fbo;
      return fbo;
    }
  }

  syncData (data) {
    // Synchronize the data props that contains every data needed for render
    const gl = this.gl;
    if (!gl) return;

    const onImageLoad = this.onImageLoad;
    const contentTextures = this._contentTextures;
    const getFBO = this.getFBO;

    // old values
    const prevShaders = this._shaders;
    const prevImages = this._images;
    const prevStandaloneTextures = this._standaloneTextures;

    // new values (mutated from traverseTree)
    const shaders = {}; // shaders cache (per Shader ID)
    const images = {}; // images cache (per src)
    const standaloneTextures = [];

    // traverseTree compute renderData from the data.
    // frameIndex is the framebuffer index of a node. (root is -1)
    function traverseTree (data) {
      const { shader: s, uniforms: dataUniforms, children: dataChildren, contextChildren: dataContextChildren, width, height, fboId } = data;

      const contextChildren = dataContextChildren.map(traverseTree);

      // Traverse children and compute children renderData.
      // We build a framebuffer mapping (from child index to fbo index)
      const children = dataChildren.map(traverseTree);

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

        if (type === "sampler2D" || type === "samplerCube") {
          // This is a texture
          uniforms[uniformName] = units ++; // affect a texture unit
          if (!value) {
            const emptyTexture = createTexture(gl, [ 2, 2 ]); // empty texture
            textures[uniformName] = emptyTexture;
            standaloneTextures.push(emptyTexture);
          }
          else switch (value.type) {
          case "content": // contents are DOM elements that can be rendered as texture (<canvas>, <img>, <video>)
            textures[uniformName] = contentTextures[value.id];
            break;

          case "fbo": // framebuffers are a children rendering
            const fbo = getFBO(value.id);
            textures[uniformName] = fbo.color[0];
            break;

          case "uri":
            const src = value.uri;
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

          case "ndarray":
            const tex = createTexture(gl, value.ndarray);
            const opts = value.opts || {}; // TODO: in next releases we will generalize opts to more types.
            if (!opts.disableLinearInterpolation)
              tex.minFilter = tex.magFilter = gl.LINEAR;
            textures[uniformName] = tex;
            standaloneTextures.push(tex);
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

      return { shader, uniforms, textures, children, contextChildren, width, height, fboId, data };
    }

    this._renderData = traverseTree(data);

    // Destroy previous states that have disappeared
    diffDispose(shaders, prevShaders);
    diffDispose(images, prevImages);
    prevStandaloneTextures.forEach(t => t.dispose());

    this._shaders = shaders;
    this._images = images;
    this._standaloneTextures = standaloneTextures;

    this._needsSyncData = false;
    this.requestDraw();
  }

  draw () {
    this._needsDraw = false;
    const gl = this.gl;
    const renderData = this._renderData;
    if (!gl || !renderData) return;
    const {scale} = this.state;
    const getFBO = this.getFBO;
    const buffer = this._buffer;

    const allocatedFromPool = [];
    const debugProbe = this._debugProbe;
    let shouldDebugCapture = false, shouldProfile = false;
    if (debugProbe) {
      if (debugProbe.capture) {
        const t = now();
        if (t - debugProbe.lastCapture > debugProbe.captureRate) {
          debugProbe.lastCapture = t;
          shouldDebugCapture = true;
        }
      }
      shouldProfile = debugProbe.profile;
    }

    function recDraw (renderData) {
      const { shader, uniforms, textures, children, contextChildren, width, height, fboId, data } = renderData;

      const debugNode = debugProbe ? { ...data, shaderInfos: extractShaderDebug(shader) } : {};
      let profileExclusive;

      const w = width * scale, h = height * scale;

      // contextChildren are rendered BEFORE children and parent because are contextual to them
      debugNode.contextChildren = contextChildren.map(recDraw);

      // children are rendered BEFORE the parent
      debugNode.children = children.map(recDraw);

      if (shouldProfile) {
        profileExclusive = now();
      }

      let fbo;
      if (fboId === -1) {
        // special case for root FBO
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, w, h);
      }
      else {
        // Use the framebuffer of the node
        fbo = getFBO(fboId);
        syncShape(fbo, [ w, h ]);
        fbo.bind();
      }

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
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);


      if (shouldProfile) {
        profileExclusive = now() - profileExclusive;
        let profileInclusiveSum = 0;
        debugNode.contextChildren.forEach(({ profileInclusive }) => {
          profileInclusiveSum += profileInclusive;
        });
        debugNode.children.forEach(({ profileInclusive }) => {
          profileInclusiveSum += profileInclusive;
        });
        debugNode.profileExclusive = profileExclusive;
        debugNode.profileInclusive = profileInclusiveSum + profileExclusive;
      }

      if (shouldDebugCapture) {
        var pixels = pool.mallocUint8(w * h * 4);
        allocatedFromPool.push(pixels);
        gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        debugNode.capture = { pixels, width: w, height: h };
      }

      return debugNode;
    }

    // Draw the content to contentTextures (assuming they ALWAYS change and need a re-draw)
    const contents = this.getDrawingUniforms();
    const contentTextures = this._contentTextures;
    const debugContents = contents.map((content, i) => {
      let profile;
      if (shouldProfile) {
        profile = now();
      }
      this.syncUniformTexture(contentTextures[i], content);
      if (shouldProfile) {
        profile = now() - profile;
      }
      if (debugProbe) {
        let capture;
        if (shouldDebugCapture) {
          capture = content; // gl-texture2d can reconciliate dom node rendering
        }
        return {
          code: content.parentNode.innerHTML,
          capture,
          profileExclusive: profile,
          profileInclusive: profile
        };
      }
    });

    // Draw everything

    gl.enable(gl.BLEND);
    const debugTree = recDraw(renderData);
    gl.disable(gl.BLEND);

    if (debugProbe) {
      if (this.allocatedFromPool) {
        this.allocatedFromPool.forEach(pool.freeUint8);
      }
      this.allocatedFromPool = allocatedFromPool;
      debugProbe.onDraw({
        tree: debugTree,
        contents: debugContents,
        Shaders
      });
    }

    if (this._captureListeners.length > 0) {
      const frame = this.canvas.toDataURL();
      this._captureListeners.forEach(listener => listener(frame));
      this._captureListeners = [];
    }
  }

  onImageLoad (loadedObj) {
    if (this._preloading) {
      this._preloading.push(loadedObj);
      const {imagesToPreload, onLoad, onProgress} = this.props;
      const loaded = countPreloaded(this._preloading, imagesToPreload);
      const total = imagesToPreload.length;
      if (onProgress) onProgress({
        progress: loaded / total,
        loaded,
        total
      });
      if (loaded == total) {
        this._preloading = null;
        this.requestSyncData();
        if (onLoad) onLoad();
      }
    }
    else {
      // Any texture image load will trigger a future re-sync of data (if no preloaded)
      this.requestSyncData();
    }
  }

  // Resize the pool of textures for the contentTextures
  resizeUniformContentTextures (n) {
    const gl = this.gl;
    const contentTextures = this._contentTextures;
    const length = contentTextures.length;
    if (length === n) return;
    if (n < length) {
      for (let i = n; i < length; i++) {
        contentTextures[i].dispose();
      }
      contentTextures.length = n;
    }
    else {
      for (let i = contentTextures.length; i < n; i++) {
        const texture = createTexture(gl, [ 2, 2 ]);
        texture.minFilter = texture.magFilter = gl.LINEAR;
        contentTextures.push(texture);
      }
    }
  }

  syncUniformTexture (texture, content) {
    const width = content.width || content.videoWidth;
    const height = content.height || content.videoHeight;
    if (width && height) { // ensure the resource is loaded
      syncShape(texture, [ width, height ]);
      texture.setPixels(content);
    }
    else {
      texture.shape = [ 2, 2 ];
    }
  }

  getDrawingUniforms () {
    const {nbContentTextures} = this.props;
    if (nbContentTextures === 0) return [];
    const children = React.findDOMNode(this.refs.render).parentNode.children;
    const all = [];
    for (var i = 0; i < nbContentTextures; i++) {
      all[i] = children[i].firstChild;
    }
    return all;
  }

  requestSyncData () {
    if (this._needsSyncData) return;
    this._needsSyncData = true;
    raf(this.handleSyncData);
  }

  handleSyncData () {
    if (!this._needsSyncData) return;
    this.syncData(this.props.data);
  }

  requestDraw () {
    if (this._needsDraw) return;
    this._needsDraw = true;
    raf(this.handleDraw);
  }

  handleDraw () {
    if (!this._needsDraw) return;
    this._needsDraw = false;
    if (this._preloading) return;
    this.draw();
  }
}

GLCanvas.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  data: PropTypes.object.isRequired,
  nbContentTextures: PropTypes.number.isRequired
};

module.exports = GLCanvas;
