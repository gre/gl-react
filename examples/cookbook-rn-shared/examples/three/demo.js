//@flow
import {
  Image,
  endFrame,
  loadThreeJSTexture,
} from "../../gl-react-implementation";
const THREE = require("three");
global.THREE = THREE;
require("three/examples/js/renderers/Projector");

const colors = [0xa2394a, 0xd30324, 0xf5677d, 0xad001b, 0xf24560, 0xee2242];

// inspired from https://github.com/mrdoob/three.js/blob/master/examples/canvas_geometry_panorama_fisheye.html

export default (gl: WebGLRenderingContext, initialProps: *) => {
  const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
  const renderer = new THREE.WebGLRenderer({
    canvas: {
      width,
      height,
      style: {},
      addEventListener: () => {},
      removeEventListener: () => {},
      clientHeight: height,
    },
    context: gl,
  });
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 1);

  let camera, scene, requestId;
  let isUserInteracting = false,
    downAtPosition,
    downAtLon,
    downAtLat,
    lon = 90,
    lat = 0,
    phi = 0,
    theta = 0,
    target = new THREE.Vector3();
  init();
  animate();
  function init() {
    let mesh;
    camera = new THREE.PerspectiveCamera(75, width / height, 1, 1100);
    camera.fov = initialProps.fov;
    scene = new THREE.Scene();
    let materials = [
      loadTexture(require("../../images/skybox/px.jpg")), // right
      loadTexture(require("../../images/skybox/nx.jpg")), // left
      loadTexture(require("../../images/skybox/py.jpg")), // top
      loadTexture(require("../../images/skybox/ny.jpg")), // bottom
      loadTexture(require("../../images/skybox/pz.jpg")), // back
      loadTexture(require("../../images/skybox/nz.jpg")), // front
    ];
    mesh = new THREE.Mesh(
      new THREE.BoxGeometry(300, 300, 300, 7, 7, 7),
      materials
    );
    mesh.scale.x = -1;
    scene.add(mesh);

    // Cube
    let cube;
    let geometry = new THREE.BoxGeometry(200, 200, 200);
    for (let i = 0; i < geometry.faces.length; i += 2) {
      let hex = colors[Math.floor(i / 2)];
      geometry.faces[i].color.setHex(hex);
      geometry.faces[i + 1].color.setHex(hex);
    }

    let material = new THREE.MeshBasicMaterial({
      vertexColors: THREE.FaceColors,
    });

    cube = new THREE.Mesh(geometry, material);
    cube.position.y = 0;
    scene.add(cube);

    for (let i = 0, l = mesh.geometry.vertices.length; i < l; i++) {
      let vertex = mesh.geometry.vertices[i];
      vertex.normalize();
      vertex.multiplyScalar(550);
    }
  }
  function loadTexture(src) {
    let texture = new THREE.Texture();
    loadThreeJSTexture(gl, src, texture, renderer);
    return texture;
  }
  function animate() {
    requestId = requestAnimationFrame(animate);
    update();
  }
  function update() {
    if (isUserInteracting === false) {
      lon += 0.1;
    }
    lat = Math.max(-85, Math.min(85, lat));
    phi = THREE.Math.degToRad(90 - lat);
    theta = THREE.Math.degToRad(lon);
    target.x = 500 * Math.sin(phi) * Math.cos(theta);
    target.y = 500 * Math.cos(phi);
    target.z = 500 * Math.sin(phi) * Math.sin(theta);
    camera.position.copy(target).negate();
    camera.lookAt(target);
    renderer.render(scene, camera);
    gl.flush();
    endFrame(gl);
  }

  return {
    onPropsChange({ fov, touching, touchPosition }: *) {
      if (fov !== camera.fov) {
        camera.fov = fov;
        camera.updateProjectionMatrix();
      }
      if (touching && !isUserInteracting) {
        downAtPosition = touchPosition;
        downAtLon = lon;
        downAtLat = lat;
      }
      isUserInteracting = touching;
      if (touching) {
        lon = (downAtPosition.x - touchPosition.x) * 100 + downAtLon;
        lat = (touchPosition.y - downAtPosition.y) * 100 + downAtLat;
      }
    },
    dispose() {
      cancelAnimationFrame(requestId);
    },
  };
};
