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

function imageObjectToId (image) {
  return image.uri;
}

function countPreloaded (loaded, toLoad) {
  let nb = 0;
  for (let i=0; i<toLoad.length; i++) {
    if (loaded.indexOf(imageObjectToId(toLoad[i]))!==-1)
      nb ++;
  }
  return nb;
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
    if (props.imagesToPreload.length > 0) {
      this._preloading = [];
    }
    else {
      this._preloading = null;
      if (this.props.onLoad) this.props.onLoad();
    }
  }

  render () {
    const { width, height,
      data, nbContentTextures, imagesToPreload, renderId, opaque, onLoad, onProgress, // eslint-disable-line
      ...rest
    } = this.props;
    const { scale } = this.state;
    const styles = {
      width: width+"px",
      height: height+"px"
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
    this.syncBlendMode(this.props);
    this.syncData(this.props.data);
  }

  componentWillUnmount () {
    // Destroy everything to avoid leaks.
    this._contentTextures.forEach(t => t.dispose());
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
    if (props.nbContentTextures !== this.props.nbContentTextures)
      this.resizeUniformContentTextures(props.nbContentTextures);
  }

  componentDidUpdate () {
    // Synchronize the rendering (after render is done)
    const { data } = this.props;
    this.syncData(data);
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

    // new values (mutated from traverseTree)
    const shaders = {}; // shaders cache (per Shader ID)
    const images = {}; // images cache (per src)

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

        if (value && (type === "sampler2D" || type === "samplerCube")) {
          // This is a texture (with a value)
          uniforms[uniformName] = units ++; // affect a texture unit
          switch (value.type) {
          case "content": // contents are DOM elements that can be rendered as texture (<canvas>, <img>, <video>)
            textures[uniformName] = contentTextures[value.id];
            break;

          case "framebuffer": // framebuffers are a children rendering
            const fbo = getFBO(value.id);
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

      return { shader, uniforms, textures, children, contextChildren, width, height, fboId };
    }

    this._renderData = traverseTree(data);

    // Destroy previous states that have disappeared
    diffDispose(shaders, prevShaders);
    diffDispose(images, prevImages);

    this._shaders = shaders;
    this._images = images;

    this._needsSyncData = false;
    this.requestDraw();
  }

  draw () {
    const gl = this.gl;
    const renderData = this._renderData;
    if (!gl || !renderData) return;
    const {scale} = this.state;
    const getFBO = this.getFBO;
    const buffer = this._buffer;

    function recDraw (renderData) {
      const { shader, uniforms, textures, children, contextChildren, width, height, fboId } = renderData;

      const w = width * scale, h = height * scale;

      // contextChildren are rendered BEFORE children and parent because are contextual to them
      contextChildren.forEach(recDraw);

      // children are rendered BEFORE the parent
      children.forEach(recDraw);

      if (fboId === -1) {
        // special case for root FBO
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, w, h);
      }
      else {
        // Use the framebuffer of the node
        const fbo = getFBO(fboId);
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

    // Draw the content to contentTextures (assuming they ALWAYS change and need a re-draw)
    this.syncUniformContentTextures();

    // Draw everything
    recDraw(renderData);
  }

  onImageLoad (loaded) {
    if (this._preloading) {
      this._preloading.push(loaded);
      const {imagesToPreload, onLoad, onProgress} = this.props;
      const count = countPreloaded(this._preloading, imagesToPreload);
      if (onProgress) onProgress(count / imagesToPreload.length);
      if (count === imagesToPreload.length) {
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

  // Draw the contentTextures
  syncUniformContentTextures () {
    const contents = this.getDrawingUniforms();
    const contentTextures = this._contentTextures;
    for (let i = 0; i < contents.length; i++) {
      const content = contents[i];
      this.syncUniformTexture(contentTextures[i], content);
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
