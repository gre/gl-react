//@flow
import Image from "gl-react-native/lib/Image";
const THREE = require("three");
global.THREE = THREE;
require("three/examples/js/renderers/Projector");

// inspired from https://github.com/mrdoob/three.js/blob/master/examples/canvas_geometry_panorama_fisheye.html

export default (gl: WebGLRenderingContext, initialProps: *) => {
  const {
    drawingBufferWidth: width,
    drawingBufferHeight: height
  } = gl;
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

  var camera, scene, requestId;
  var isUserInteracting = false,
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
    var mesh;
    camera = new THREE.PerspectiveCamera( 75, width / height, 1, 1100 );
    camera.fov = initialProps.fov;
    scene = new THREE.Scene();
    var materials = [
      loadTexture(require("./skybox/px.jpg")), // right
      loadTexture(require("./skybox/nx.jpg")), // left
      loadTexture(require("./skybox/py.jpg")), // top
      loadTexture(require("./skybox/ny.jpg")), // bottom
      loadTexture(require("./skybox/pz.jpg")), // back
      loadTexture(require("./skybox/nz.jpg")) // front
    ];
    mesh = new THREE.Mesh( new THREE.BoxGeometry( 300, 300, 300, 7, 7, 7 ), new THREE.MultiMaterial( materials ) );
    mesh.scale.x = - 1;
    scene.add( mesh );
    for ( var i = 0, l = mesh.geometry.vertices.length; i < l; i ++ ) {
      var vertex = mesh.geometry.vertices[ i ];
      vertex.normalize();
      vertex.multiplyScalar( 550 );
    }
  }
  function loadTexture (src) {
    var texture = new THREE.Texture();
    var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
    var image = new Image();
    image.onload = function () {
      texture.image = this;
      texture.needsUpdate = true;
    };
    image.src = src;
    return material;
  }
  function animate() {
    requestId = requestAnimationFrame(animate);
    update();
  }
  function update() {
    if ( isUserInteracting === false ) {
      lon += 0.1;
    }
    lat = Math.max( - 85, Math.min( 85, lat ) );
    phi = THREE.Math.degToRad( 90 - lat );
    theta = THREE.Math.degToRad( lon );
    target.x = 500 * Math.sin( phi ) * Math.cos( theta );
    target.y = 500 * Math.cos( phi );
    target.z = 500 * Math.sin( phi ) * Math.sin( theta );
    camera.position.copy( target ).negate();
    camera.lookAt( target );
    renderer.render( scene, camera );
    gl.flush();
    gl.endFrameEXP();
  }

  return {
    onPropsChange ({ fov, touching, touchPosition }: *) {
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
        lon = ( downAtPosition.x - touchPosition.x ) * 100 + downAtLon;
        lat = ( touchPosition.y - downAtPosition.y ) * 100 + downAtLat;
      }
    },
    dispose () {
      cancelAnimationFrame(requestId);
    },
  };
};
