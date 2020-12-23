import Vec3ColorPicker from "../../toolbox/Vec3ColorPicker";
import markdown from "../../markdown";
export const toolbox = [
  { prop: "fromColor", title: "fromColor", Editor: Vec3ColorPicker },
  { prop: "toColor", title: "toColor", Editor: Vec3ColorPicker },
];

export const title = "Colored Disc {fromColor, toColor} uniforms";

export const desc = markdown`
Implement a simple radial gradient.
`;

export const descAfter = markdown`
Learn more GLSL built-in functions:
see [GLSL_ES_Specification_1.0.17.pdf](http://www.khronos.org/registry/gles/specs/2.0/GLSL_ES_Specification_1.0.17.pdf)
`;
