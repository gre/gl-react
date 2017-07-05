//@flow
import Bus from "./Bus";
import connectSize from "./connectSize";
import createSurface, { list as listSurfaces } from "./createSurface";
import GLSL from "./GLSL";
import LinearCopy from "./LinearCopy";
import NearestCopy from "./NearestCopy";
import Node from "./Node";
import Shaders from "./Shaders";
import TextureLoader from "./TextureLoader";
import TextureLoaderRawObject from "./TextureLoaderRawObject";
import TextureLoaders from "./TextureLoaders";
import Uniform_ from "./Uniform";
import Visitor from "./Visitor";
import VisitorLogger from "./VisitorLogger";
import Visitors from "./Visitors";

import { Uniform, createComponent } from "./legacy";
export { createComponent };
Object.assign(Uniform, Uniform_); // we use the Uniform legacy class for now to preserve legacy feature (helping user migrating)

export {
  Bus,
  connectSize,
  createSurface,
  listSurfaces,
  GLSL,
  LinearCopy,
  NearestCopy,
  Node,
  Shaders,
  TextureLoader,
  TextureLoaderRawObject,
  TextureLoaders,
  Uniform,
  Visitor,
  VisitorLogger,
  Visitors
};

// DEPRECATED
export const Backbuffer = "Backbuffer";

export type { Surface } from "./createSurface";
