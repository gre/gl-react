const invariant = require("invariant");

const findContentsUniq = require("./findContentsUniq");
const findChildrenDuplicates = require("./findChildrenDuplicates");
const TextureObjects = require("./TextureObjects");
const extractImages = require("./extractImages");
const uniqImages = require("./uniqImages");

///// resolve: takes the output of fill(build(*)) to generate the final data tree
// The algorithm simplifies the data tree to use shared framebuffers if some VDOM is duplicated in the tree (e.g: content / GL.Node)

function resolve (dataTree) {
  let imagesToPreload = [];

  // contents are view/canvas/image/video to be rasterized "globally"
  const contentsMeta = findContentsUniq(dataTree);
  const contentsVDOM = contentsMeta.map(({vdom}) => vdom);

  // Recursively "resolve" the data to assign fboId and factorize duplicate uniforms to shared uniforms.
  function resolveRec (data, fboId, parentContext, parentFbos) {
    const { uniforms: dataUniforms, children: dataChildren, contents: dataContents, preload, ...dataRest } = data;
    const uniforms = {...dataUniforms};
    const parentContextVDOM = parentContext.map(({vdom}) => vdom);

    // A function to generate a free FBO id for this node
    const genFboId = (fboIdCounter =>
      () => {
        fboIdCounter ++;
        while (
          fboIdCounter === fboId || // fbo should not take the current one
          parentFbos.indexOf(fboIdCounter)!==-1) // ensure fbo is not already taken in parents
          fboIdCounter ++;
        return fboIdCounter;
      }
    )(-1);

    // shared contains all nodes that are contains in more than one direct children.
    const shared = findChildrenDuplicates(data, parentContextVDOM);

    // We assign fboIds to shared
    const childrenContext = shared.map(({vdom}) => {
      const fboId = genFboId();
      return { vdom, fboId };
    });

    // We accumulate into context the childrenContext and the parentContext
    const context = parentContext.concat(childrenContext);
    const contextVDOM = context.map(({vdom}) => vdom);
    const contextFbos = context.map(({fboId}) => fboId);

    // contextChildren and children are field to fill for this node
    // We traverse the dataChildren to resolve where each child should go:
    // either we create a new child, a we create context child or we use an existing parent context
    const contextChildren = [];
    const children = [];

    const toRecord = dataChildren.concat(shared).map(child => {
      const { uniform, vdom, data } = child;
      let i = contextVDOM.indexOf(vdom);
      let fboId, addToCollection;
      if (i===-1) {
        fboId = genFboId();
        addToCollection = children;
      }
      else {
        fboId = context[i].fboId;
        if (i >= parentContext.length) {// is a new context children
          addToCollection = contextChildren;
        }
      }
      if (uniform) uniforms[uniform] = TextureObjects.Framebuffer(fboId);
      return { data, fboId, addToCollection };
    });

    const childrenFbos = toRecord.map(({fboId})=>fboId);
    const allFbos = parentFbos.concat(contextFbos).concat(childrenFbos);

    const recorded = [];
    toRecord.forEach(({ data, fboId, addToCollection }) => {
      if (recorded.indexOf(fboId) === -1) {
        recorded.push(fboId);
        if (addToCollection) addToCollection.unshift(resolveRec(data, fboId, context, allFbos));
      }
    });

    dataContents.forEach(({ uniform, vdom, opts }) => {
      const id = contentsVDOM.indexOf(vdom);
      invariant(id!==-1, "contents was discovered by findContentsMeta");
      uniforms[uniform] = TextureObjects.withOpts(TextureObjects.Content(id), opts);
    });

    // Check images to preload
    if (preload) {
      imagesToPreload = imagesToPreload.concat(extractImages(dataUniforms));
    }

    return {
      ...dataRest, // eslint-disable-line no-undef
      uniforms,
      contextChildren,
      children,
      fboId
    };
  }

  return {
    data: resolveRec(dataTree, -1, [], []),
    contentsVDOM,
    imagesToPreload: uniqImages(imagesToPreload)
  };
}

module.exports = resolve;
