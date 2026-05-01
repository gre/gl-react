import type { ComponentType } from "react";

import HelloGL from "./hellogl";
import HelloBlue from "./helloblue";
import HelloBlueAnim from "./helloblueanim";
import ColorDisc from "./colordisc";
import Gradients from "./gradients";
import Heart from "./heart";
import Saturation from "./saturation";
import ColorScale from "./colorscale";
import MergeChannels from "./mergechannels";
import MergeChannelsFun from "./mergechannelsfun";
import DiamondCrop from "./diamondcrop";
import DiamondHello from "./diamondhello";
import DiamondAnim from "./diamondanim";
import BlurXY from "./blurxy";
import BlurXYDownscale from "./blurxydownscale";
import BlurMulti from "./blurmulti";
import BlurMap from "./blurmap";
import BlurMapDyn from "./blurmapdyn";
import BlurMapMouse from "./blurmapmouse";
import BlurFeedback from "./blurfeedback";
import DemoTunnel from "./demotunnel";
import DemoDesert from "./demodesert";
import DemoDesertCRT from "./demodesertcrt";
import SDF1 from "./sdf1";
import GOL from "./gol";
import GOLGlider from "./golglider";
import GOLRot from "./golrot";
import GOLRotSCU from "./golrotscu";
import Distortion from "./distortion";
import Paint from "./paint";
import PixelEditor from "./pixeleditor";
import Animated from "./animated";
import ReactMotion from "./reactmotion";
import Transitions from "./transitions";
import BehindAsteroids from "./behindasteroids";
import IBEX from "./ibex";
import Webcam from "./webcam";
import WebcamPersistence from "./webcampersistence";
import GOLWebcam from "./golwebcam";

export interface ExampleEntry {
  id: string;
  title: string;
  description: string;
  category: string;
  Component: ComponentType<any>;
}

// Mirrors packages/cookbook-v2/src/examples/index.ts. Examples that depend
// on DOM-only APIs (live GLSL editor textarea, video files, custom canvas
// text rendering) are listed in the README's "TODO/unported" section
// instead of this registry.
export const examples: ExampleEntry[] = [
  // === Basics ===
  {
    id: "hellogl",
    title: "Hello GL",
    description: "First gl-react example: a UV-coordinate gradient",
    category: "Basics",
    Component: HelloGL,
  },
  {
    id: "helloblue",
    title: "Hello GL Blue",
    description: "Pass a uniform from JS to the shader",
    category: "Basics",
    Component: HelloBlue,
  },
  {
    id: "helloblueanim",
    title: "Hello GL Blue Animated",
    description: "Animate a uniform with requestAnimationFrame",
    category: "Basics",
    Component: HelloBlueAnim,
  },
  {
    id: "colordisc",
    title: "Colored Disc",
    description: "Radial gradient disc with vec3 uniforms",
    category: "Basics",
    Component: ColorDisc,
  },
  {
    id: "gradients",
    title: "Rotating Gradients",
    description: "Animated radial gradients with uniform arrays",
    category: "Basics",
    Component: Gradients,
  },
  {
    id: "heart",
    title: "Heart Animation",
    description: "Tap to toggle, press to hover (spring physics)",
    category: "Basics",
    Component: Heart,
  },

  // === Textures ===
  {
    id: "saturation",
    title: "Contrast / Saturation / Brightness",
    description: "Apply contrast, saturation, brightness to an image",
    category: "Textures",
    Component: Saturation,
  },
  {
    id: "colorscale",
    title: "Color Scale",
    description: "Color-map an image using a 1D LUT (spectral, plasma…)",
    category: "Textures",
    Component: ColorScale,
  },
  {
    id: "mergechannels",
    title: "Merge Channels",
    description: "Compose R/G/B from three texture sources",
    category: "Textures",
    Component: MergeChannels,
  },
  {
    id: "mergechannelsfun",
    title: "Merge Channels Fun",
    description: "Compose channels from images and a Game of Life node",
    category: "Textures",
    Component: MergeChannelsFun,
  },

  // === Composition ===
  {
    id: "diamondcrop",
    title: "Diamond Crop",
    description: "Diamond-shaped crop applied on an image",
    category: "Composition",
    Component: DiamondCrop,
  },
  {
    id: "diamondhello",
    title: "Diamond + HelloBlue",
    description: "Compose DiamondCrop with HelloBlue",
    category: "Composition",
    Component: DiamondHello,
  },
  {
    id: "diamondanim",
    title: "Diamond Animated",
    description: "Animated HelloRed composed with DiamondCrop",
    category: "Composition",
    Component: DiamondAnim,
  },

  // === Blur ===
  {
    id: "blurxy",
    title: "Simple Blur (2-pass)",
    description: "Separable Gaussian blur in X then Y (connectSize)",
    category: "Blur",
    Component: BlurXY,
  },
  {
    id: "blurxydownscale",
    title: "Blur + Downscale",
    description: "Same blur, downscaled for performance",
    category: "Blur",
    Component: BlurXYDownscale,
  },
  {
    id: "blurmulti",
    title: "Multi-pass Blur",
    description: "4-direction blur (H, V, two diagonals)",
    category: "Blur",
    Component: BlurMulti,
  },
  {
    id: "blurmap",
    title: "Blur Map",
    description: "Per-pixel variable blur driven by a map texture",
    category: "Blur",
    Component: BlurMap,
  },
  {
    id: "blurmapdyn",
    title: "Blur Map Dynamic",
    description: "Blur map generated from a rotating gradient shader",
    category: "Blur",
    Component: BlurMapDyn,
  },
  {
    id: "blurmapmouse",
    title: "Blur Map Touch",
    description: "Blur map controlled by touch position",
    category: "Blur",
    Component: BlurMapMouse,
  },
  {
    id: "blurfeedback",
    title: "Blur Feedback",
    description: "Persistence effect via backbuffering",
    category: "Blur",
    Component: BlurFeedback,
  },

  // === Demos / Shadertoy ===
  {
    id: "demotunnel",
    title: "Square Tunnel",
    description: "Classic Shadertoy tunnel effect",
    category: "Demos",
    Component: DemoTunnel,
  },
  {
    id: "demodesert",
    title: "Desert Passage",
    description: "Ray-marched desert cave with lighting",
    category: "Demos",
    Component: DemoDesert,
  },
  {
    id: "demodesertcrt",
    title: "Desert + CRT",
    description: "Desert passage with CRT scanline effect",
    category: "Demos",
    Component: DemoDesertCRT,
  },
  {
    id: "sdf1",
    title: "Signed Distance Field",
    description: "Ray-marched SDF scene with HSV coloring",
    category: "Demos",
    Component: SDF1,
  },

  // === Game of Life ===
  {
    id: "gol",
    title: "Game of Life",
    description: "Conway's GOL with backbuffering, periodic reseed",
    category: "Game of Life",
    Component: GOL,
  },
  {
    id: "golglider",
    title: "Game of Life (Glider)",
    description: "GOL initialized from a Gosper glider gun",
    category: "Game of Life",
    Component: GOLGlider,
  },
  {
    id: "golrot",
    title: "Rotating GOL",
    description: "Game of Life with a rotation/scale effect",
    category: "Game of Life",
    Component: GOLRot,
  },
  {
    id: "golrotscu",
    title: "Rotating GOL (memo)",
    description: "Same as golrot, with useMemo to limit re-renders",
    category: "Game of Life",
    Component: GOLRotSCU,
  },

  // === Interactive ===
  {
    id: "distortion",
    title: "Vignette Distortion",
    description: "Color-separation distortion following touch",
    category: "Interactive",
    Component: Distortion,
  },
  {
    id: "paint",
    title: "Paint",
    description: "Freehand painting (discard + preserveDrawingBuffer)",
    category: "Interactive",
    Component: Paint,
  },
  {
    id: "pixeleditor",
    title: "Pixel Editor",
    description: "16x16 pixel art editor with grid overlay",
    category: "Interactive",
    Component: PixelEditor,
  },

  // === Animation ===
  {
    id: "animated",
    title: "Animated (Spring)",
    description: "Cursor spring effect with physics",
    category: "Animation",
    Component: Animated,
  },
  {
    id: "reactmotion",
    title: "React Motion (Spring)",
    description: "Spring effect with stiffer config",
    category: "Animation",
    Component: ReactMotion,
  },

  // === Transitions ===
  {
    id: "transitions",
    title: "GL Transitions",
    description: "Slideshow with animated GL transitions",
    category: "Transitions",
    Component: Transitions,
  },

  // === Games ===
  {
    id: "behindasteroids",
    title: "Behind Asteroids",
    description: "Complex composition: glare + blur + persistence (js13k 2015)",
    category: "Games",
    Component: BehindAsteroids,
  },
  {
    id: "ibex",
    title: "IBEX",
    description: "Cellular-automaton world simulation (js13k 2014)",
    category: "Games",
    Component: IBEX,
  },

  // === Camera ===
  {
    id: "webcam",
    title: "Camera + Color Scale",
    description: "Camera stream with colorify effect",
    category: "Camera",
    Component: Webcam,
  },
  {
    id: "webcampersistence",
    title: "Camera Persistence",
    description: "Camera with motion-trail backbuffer feedback",
    category: "Camera",
    Component: WebcamPersistence,
  },
  {
    id: "golwebcam",
    title: "GOL + Camera",
    description: "Game of Life seeded from the camera",
    category: "Camera",
    Component: GOLWebcam,
  },
];
