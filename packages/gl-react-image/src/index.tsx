import React from "react";
import { Shaders, Node, GLSL, LinearCopy, Uniform } from "gl-react";

const shaders = Shaders.create({
  contain: {
    vert: GLSL`
attribute vec2 _p;
varying vec2 uv;
uniform float tR;
uniform vec2 res;
float r;
void main() {
  r = res.x / res.y;
  gl_Position = vec4(_p,0.0,1.0);
  uv = .5+.5*_p*vec2(max(r/tR,1.),max(tR/r,1.));
}
    `,
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
void main () {
  gl_FragColor =
    step(0.0, uv.x) *
    step(0.0, uv.y) *
    step(uv.x, 1.0) *
    step(uv.y, 1.0) *
    texture2D(t, uv);
}
    `,
  },
  free: {
    vert: GLSL`
attribute vec2 _p;
varying vec2 uv;
uniform float zoom;
uniform vec2 center;
uniform float tR;
uniform vec2 res;
float r;
vec2 invert (vec2 p) {
  return vec2(p.x, 1.0-p.y);
}
void main() {
  r = res.x / res.y;
  gl_Position = vec4(_p,0.0,1.0);
  // crop with zoom & center in a cover mode. preserving image ratio
  float maxR = max(r, tR);
  vec2 zoomedCanvasSize = vec2(
    (r / maxR) * zoom,
    (tR / maxR) * zoom
  );
  vec4 crop = vec4(
    center.x - zoomedCanvasSize.x / 2.,
    center.y - zoomedCanvasSize.y / 2.,
    zoomedCanvasSize.x,
    zoomedCanvasSize.y
  );
  // apply the crop rectangle
  uv = invert(invert(.5+.5*_p) * crop.zw + crop.xy);
}
    `,
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
void main () {
  gl_FragColor =
    step(0.0, uv.x) *
    step(0.0, uv.y) *
    step(uv.x, 1.0) *
    step(uv.y, 1.0) *
    texture2D(t, uv);
}
    `,
  },
  cover: {
    // NB the cover vertex code can probably be simplified. good enough for now.
    vert: GLSL`
attribute vec2 _p;
varying vec2 uv;
uniform float zoom;
uniform vec2 center;
uniform float tR;
uniform vec2 res;
float r;

vec2 invert (vec2 p) {
  return vec2(p.x, 1.0-p.y);
}
void main() {
  r = res.x / res.y;
  gl_Position = vec4(_p,0.0,1.0);
  // crop with zoom & center in a cover mode. preserving image ratio
  float maxR = max(r, tR);
  vec2 zoomedCanvasSize = vec2(
    (r / maxR) * zoom,
    (tR / maxR) * zoom
  );
  vec4 crop = vec4(
    center.x - zoomedCanvasSize.x / 2.,
    center.y - zoomedCanvasSize.y / 2.,
    zoomedCanvasSize.x,
    zoomedCanvasSize.y
  );
  // clamp to not escape the edges
  float w = crop[2], h = crop[3];
  float ratio = w / h;
  if (w > 1.) {
    w = 1.;
    h = w / ratio;
  }
  if (h > 1.) {
    h = 1.;
    w = h * ratio;
  }
  crop = vec4(
    max(0., min(crop.x, 1.-w)),
    max(0., min(crop.y, 1.-h)),
    w,
    h
  );
  // apply the crop rectangle
  uv = invert(invert(.5+.5*_p) * crop.zw + crop.xy);
}
    `,
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
void main () {
  gl_FragColor = texture2D(t, uv);
}
    `,
  },
});

export type GLImageResizeMode = "cover" | "free" | "contain" | "stretch";

export type GLImageProps = {
  /** any gl-react texture input (URL, image element, Node, Bus ref, ...) */
  source: any;
  /**
   * - "cover": fills the area, cropping the image (default). `center`/`zoom`
   *   move the crop window, clamped so the image always covers the area.
   * - "free": like "cover" but without clamping; out-of-image areas are
   *   transparent.
   * - "contain": letterboxes the image to fit entirely in the area.
   * - "stretch": distorts the image to the area size.
   */
  resizeMode?: GLImageResizeMode;
  /** crop window center in image coordinates, only for "cover" and "free" */
  center?: [number, number];
  /** crop window zoom level, only for "cover" and "free" */
  zoom?: number;
} & Record<string, any>;

export default function GLImage({
  source,
  resizeMode = "cover",
  center,
  zoom,
  ...rest
}: GLImageProps) {
  if (resizeMode === "cover" || resizeMode === "free") {
    return (
      <Node
        {...rest}
        shader={resizeMode === "cover" ? shaders.cover : shaders.free}
        uniforms={{
          t: source,
          tR: Uniform.textureSizeRatio(source),
          res: Uniform.Resolution,
          center: center || [0.5, 0.5],
          zoom: zoom || 1,
        }}
      />
    );
  }

  if (resizeMode === "contain") {
    return (
      <Node
        {...rest}
        shader={shaders.contain}
        uniforms={{
          t: source,
          tR: Uniform.textureSizeRatio(source),
          res: Uniform.Resolution,
        }}
      />
    );
  }

  // fallback on stretch, most basic thing
  return <LinearCopy {...rest}>{source}</LinearCopy>;
}
