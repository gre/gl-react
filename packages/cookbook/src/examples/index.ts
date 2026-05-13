import { lazy, ComponentType, LazyExoticComponent } from "react";
import type { ControlsMap } from "../controls";

export interface ExampleEntry {
  id: string;
  title: string;
  description: string;
  category: string;
  Component: LazyExoticComponent<ComponentType<any>>;
  controls?: ControlsMap;
}

export const examples: ExampleEntry[] = [
  // === Basics ===
  {
    id: "hellogl",
    title: "Hello GL",
    description: "First gl-react example: a simple gradient using uv coordinates",
    category: "Basics",
    Component: lazy(() => import("./hellogl")),
  },
  {
    id: "helloblue",
    title: "Hello GL Blue",
    description: "Uniforms: pass a blue value from JS to the shader",
    category: "Basics",
    Component: lazy(() => import("./helloblue")),
    controls: {
      blue: { type: "float", label: "Blue Color", min: 0, max: 1, step: 0.01, default: 0.5 },
    },
  },
  {
    id: "helloblueanim",
    title: "Hello GL Blue Animated",
    description: "Animate a uniform over time with requestAnimationFrame",
    category: "Basics",
    Component: lazy(() => import("./helloblueanim")),
  },
  {
    id: "colordisc",
    title: "Colored Disc",
    description: "Radial gradient disc with fromColor/toColor vec3 uniforms",
    category: "Basics",
    Component: lazy(() => import("./colordisc")),
    controls: {
      fromColor: { type: "color", label: "From Color", default: [1, 0, 1] as [number, number, number] },
      toColor: { type: "color", label: "To Color", default: [1, 1, 0] as [number, number, number] },
    },
  },
  {
    id: "gradients",
    title: "Rotating Gradients",
    description: "Animated radial gradients with uniform arrays (vec4[], vec2[])",
    category: "Basics",
    Component: lazy(() => import("./gradients")),
  },
  {
    id: "heart",
    title: "Heart Animation",
    description: "Interactive heart with mouse hover and click, spring animation",
    category: "Basics",
    Component: lazy(() => import("./heart")),
  },

  // === Textures & Images ===
  {
    id: "saturation",
    title: "Contrast / Saturation / Brightness",
    description: "Apply contrast, saturation and brightness on an image texture",
    category: "Textures",
    Component: lazy(() => import("./saturation")),
    controls: {
      contrast: { type: "float", label: "Contrast", min: 0, max: 2, step: 0.05, default: 1 },
      saturation: { type: "float", label: "Saturation", min: 0, max: 2, step: 0.05, default: 1 },
      brightness: { type: "float", label: "Brightness", min: 0, max: 2, step: 0.05, default: 1 },
    },
  },
  {
    id: "colorscale",
    title: "Color Scale",
    description: "Color mapping an image with a gradient texture (spectral, plasma, magma...)",
    category: "Textures",
    Component: lazy(() => import("./colorscale")),
    controls: {
      color: {
        type: "select",
        label: "Color Scale",
        options: [
          { key: "spectral", label: "Spectral" },
          { key: "OrRd", label: "OrRd" },
          { key: "PuBu", label: "PuBu" },
          { key: "Oranges", label: "Oranges" },
          { key: "Reds", label: "Reds" },
          { key: "Blues", label: "Blues" },
          { key: "Greens", label: "Greens" },
          { key: "Greys", label: "Greys" },
          { key: "YlOrBr", label: "YlOrBr" },
          { key: "BuGn", label: "BuGn" },
          { key: "RdYlGn", label: "RdYlGn" },
        ],
        default: "spectral",
      },
    },
  },
  {
    id: "mergechannels",
    title: "Merge Channels",
    description: "Merge R, G, B channels from different texture sources (sampler2D[])",
    category: "Textures",
    Component: lazy(() => import("./mergechannels")),
  },
  {
    id: "mergechannelsfun",
    title: "Merge Channels Fun",
    description: "Merge channels with various texture types: canvas text, Game of Life, video",
    category: "Textures",
    Component: lazy(() => import("./mergechannelsfun")),
  },

  // === Composition ===
  {
    id: "diamondcrop",
    title: "Diamond Crop",
    description: "Diamond-shaped crop shader applied on an image",
    category: "Composition",
    Component: lazy(() => import("./diamondcrop")),
  },
  {
    id: "diamondhello",
    title: "Diamond + HelloBlue",
    description: "Composing DiamondCrop with HelloBlue: a Node as texture for another Node",
    category: "Composition",
    Component: lazy(() => import("./diamondhello")),
  },
  {
    id: "diamondanim",
    title: "Diamond Animated",
    description: "Animated HelloGL (red) composed with DiamondCrop",
    category: "Composition",
    Component: lazy(() => import("./diamondanim")),
  },

  // === Blur ===
  {
    id: "blurxy",
    title: "Simple Blur (2-passes)",
    description: "Gaussian blur in X and Y directions using connectSize",
    category: "Blur",
    Component: lazy(() => import("./blurxy")),
    controls: {
      factor: { type: "float", label: "Blur Factor", min: 0, max: 4, step: 0.1, default: 1 },
    },
  },
  {
    id: "blurxydownscale",
    title: "Simple Blur + Downscale",
    description: "Same blur but downscaled for better performance",
    category: "Blur",
    Component: lazy(() => import("./blurxydownscale")),
    controls: {
      factor: { type: "float", label: "Blur Factor", min: 0, max: 4, step: 0.1, default: 2 },
    },
  },
  {
    id: "blurmulti",
    title: "Multi-pass Blur",
    description: "4-pass blur: horizontal, vertical, and two diagonals",
    category: "Blur",
    Component: lazy(() => import("./blurmulti")),
    controls: {
      factor: { type: "float", label: "Blur Factor", min: 0, max: 6, step: 0.1, default: 2 },
    },
  },
  {
    id: "blurmap",
    title: "Blur Map",
    description: "Variable blur intensity controlled by a blur map texture",
    category: "Blur",
    Component: lazy(() => import("./blurmap")),
    controls: {
      factor: { type: "float", label: "Blur Factor", min: 0, max: 6, step: 0.1, default: 2 },
    },
  },
  {
    id: "blurmapdyn",
    title: "Blur Map Dynamic",
    description: "Dynamic blur map generated from a rotating gradient shader",
    category: "Blur",
    Component: lazy(() => import("./blurmapdyn")),
  },
  {
    id: "blurmapmouse",
    title: "Blur Map Mouse",
    description: "Blur map controlled by mouse position",
    category: "Blur",
    Component: lazy(() => import("./blurmapmouse")),
  },
  {
    id: "blurimgtitle",
    title: "Dynamic Blur Image Title",
    description: "Image with blurred text title overlay using Bus",
    category: "Blur",
    Component: lazy(() => import("./blurimgtitle")),
    controls: {
      title: { type: "textarea", label: "Title Text", default: "Hello\nSan Francisco\n\u263B" },
      colorThreshold: { type: "float", label: "Color Threshold", min: 0, max: 1, step: 0.05, default: 0.6 },
    },
  },
  {
    id: "blurvideo",
    title: "Video Blur",
    description: "Video + multi-pass blur + contrast/saturation/brightness",
    category: "Blur",
    Component: lazy(() => import("./blurvideo")),
    controls: {
      contrast: { type: "float", label: "Contrast", min: 0, max: 2, step: 0.05, default: 1 },
      saturation: { type: "float", label: "Saturation", min: 0, max: 2, step: 0.05, default: 1 },
      brightness: { type: "float", label: "Brightness", min: 0, max: 2, step: 0.05, default: 1 },
      factor: { type: "float", label: "Blur", min: 0, max: 8, step: 0.2, default: 2 },
      passes: { type: "float", label: "Blur Passes", min: 1, max: 8, step: 1, default: 4 },
    },
  },
  {
    id: "blurfeedback",
    title: "Blur Feedback",
    description: "Blur feedback using backbuffering for persistence effects",
    category: "Blur",
    Component: lazy(() => import("./blurfeedback")),
  },

  // === Demos / Shadertoy ===
  {
    id: "demotunnel",
    title: "Square Tunnel",
    description: "Classic Shadertoy tunnel effect",
    category: "Demos",
    Component: lazy(() => import("./demotunnel")),
  },
  {
    id: "demodesert",
    title: "Desert Passage",
    description: "Advanced Shadertoy ray-marched desert cave with lighting",
    category: "Demos",
    Component: lazy(() => import("./demodesert")),
  },
  {
    id: "demodesertcrt",
    title: "Desert + CRT Effect",
    description: "Desert passage with CRT scanline effect overlay",
    category: "Demos",
    Component: lazy(() => import("./demodesertcrt")),
  },
  {
    id: "sdf1",
    title: "Signed Distance Field",
    description: "Ray-marched SDF scene with animated shapes and HSV coloring",
    category: "Demos",
    Component: lazy(() => import("./sdf1")),
  },

  // === Game of Life ===
  {
    id: "gol",
    title: "Game of Life",
    description: "Conway's Game of Life using backbuffering, resets every 20 ticks",
    category: "Game of Life",
    Component: lazy(() => import("./gol")),
  },
  {
    id: "golglider",
    title: "Game of Life (Glider)",
    description: "Game of Life initialized with a Gosper glider gun pattern",
    category: "Game of Life",
    Component: lazy(() => import("./golglider")),
  },
  {
    id: "golrot",
    title: "Rotating Game of Life",
    description: "Game of Life with a rotation/scale effect applied on top",
    category: "Game of Life",
    Component: lazy(() => import("./golrot")),
  },
  {
    id: "golrotscu",
    title: "Rotating GOL (optimized)",
    description: "Rotating Game of Life with shouldComponentUpdate optimization",
    category: "Game of Life",
    Component: lazy(() => import("./golrotscu")),
  },
  {
    id: "golwebcam",
    title: "Game of Life + WebCam",
    description: "Game of Life seeded from webcam input",
    category: "Game of Life",
    Component: lazy(() => import("./golwebcam")),
  },

  // === Interactive ===
  {
    id: "distortion",
    title: "Vignette Distortion",
    description: "Color separation distortion effect following mouse position",
    category: "Interactive",
    Component: lazy(() => import("./distortion")),
  },
  {
    id: "glsledit",
    title: "GLSL Live Editor",
    description: "Edit GLSL shader code in real-time with error feedback",
    category: "Interactive",
    Component: lazy(() => import("./glsledit")),
  },
  {
    id: "paint",
    title: "Paint",
    description: "Freehand painting using discard shader and preserveDrawingBuffer",
    category: "Interactive",
    Component: lazy(() => import("./paint")),
  },
  {
    id: "pixeleditor",
    title: "Pixel Editor",
    description: "16x16 pixel art editor with grid overlay and PNG export",
    category: "Interactive",
    Component: lazy(() => import("./pixeleditor")),
  },

  // === Animation Libraries ===
  {
    id: "animated",
    title: "Animated (Spring)",
    description: "Cursor spring effect using spring physics animation",
    category: "Animation",
    Component: lazy(() => import("./animated")),
  },
  {
    id: "reactmotion",
    title: "React Motion (Spring)",
    description: "Cursor spring effect with configurable stiffness and damping",
    category: "Animation",
    Component: lazy(() => import("./reactmotion")),
  },

  // === Text ===
  {
    id: "textanimated",
    title: "Animated Text",
    description: "Edit text and see it animated with wavy distortion effect",
    category: "Text",
    Component: lazy(() => import("./textanimated")),
  },
  {
    id: "textfunky",
    title: "Funky Text",
    description: "Render text and apply funky color modulation effects",
    category: "Text",
    Component: lazy(() => import("./textfunky")),
  },

  // === Media ===
  {
    id: "video",
    title: "Video Split Colors",
    description: "Video playback with R/G/B channel splitting",
    category: "Media",
    Component: lazy(() => import("./video")),
  },
  {
    id: "webcam",
    title: "WebCam + Color Scale",
    description: "WebCam stream with colorify effect (spectral, plasma...)",
    category: "Media",
    Component: lazy(() => import("./webcam")),
  },
  {
    id: "webcampersistence",
    title: "WebCam Persistence",
    description: "WebCam with motion persistence trails using backbuffer feedback",
    category: "Media",
    Component: lazy(() => import("./webcampersistence")),
  },

  // === Transitions ===
  {
    id: "transitions",
    title: "GL Transitions",
    description: "Slideshow with animated GL transitions between images",
    category: "Transitions",
    Component: lazy(() => import("./transitions")),
  },

  // === Games ===
  {
    id: "behindasteroids",
    title: "Behind Asteroids",
    description: "Behind Asteroids (js13k 2015) - complex shader composition with glare, blur, persistence",
    category: "Games",
    Component: lazy(() => import("./behindasteroids")),
  },
  {
    id: "ibex",
    title: "IBEX",
    description: "IBEX (js13k 2014) - cellular automaton world simulation",
    category: "Games",
    Component: lazy(() => import("./ibex")),
  },
];
