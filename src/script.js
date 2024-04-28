import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import gsap from "gsap";
import { loadModel } from "./js/loadModel";
import { loadWheelBase } from "./js/loadWheelBase";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

import waterVertexShader from "./shaders/fire/vertex.glsl";
import waterFragmentShader from "./shaders/fire/fragment.glsl";

const urls = [
  new THREE.TextureLoader().load("/models/px.jpg"),
  new THREE.TextureLoader().load("/models/nx.jpg"),
  new THREE.TextureLoader().load("/models/py.jpg"),
  new THREE.TextureLoader().load("/models/ny.jpg"),
  new THREE.TextureLoader().load("/models/pz.jpg"),
  new THREE.TextureLoader().load("/models/nz.jpg"),
];

// Debug
const gui = new dat.GUI({
  width: 340,
});

const debugObject = {};

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

let sceneMaterial;

let composer;

/**
 * Lights
 */

let ax = new THREE.AxesHelper(50);
// scene.add(ax)

let light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(2, 2, 0);

// light.castShadow = true;
// light.shadow.mapSize.width = 1024;
// light.shadow.mapSize.height = 1024;
// light.shadow.camera.near = 0.5;
// light.shadow.camera.far = 500;

// let camSize = 10;
// light.shadow.camera.left = -camSize;
// light.shadow.camera.bottom = -camSize;
// light.shadow.camera.right = camSize;
// light.shadow.camera.top = camSize;

let ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
// scene.add(light)
scene.add(light);

scene.add(ambientLight);

//Color
debugObject.debthColor = "#186691";
debugObject.surfaceColor = "#9bd8ff";

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
// camera.position.set(0, 0, 15);
camera.position.set(0, 2.4, 1.1);

camera.lookAt(new THREE.Vector3(0, 1.2, 0));

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ReinhardToneMapping;
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// renderer.antialias = true;

const params = {
  threshold: 0.1,
  strength: 0.2,
  radius: 0,
  exposure: 1,
};
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85
);
bloomPass.threshold = params.threshold;
bloomPass.strength = params.strength;
bloomPass.radius = params.radius;

const outputPass = new OutputPass();

composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);
composer.addPass(outputPass);

function createSlice(radius, angle, material) {
  const shape = new THREE.Shape();

  shape.moveTo(0, 0);
  shape.lineTo(radius, 0); // Move to the radius on the x-axis
  shape.lineTo(radius * Math.cos(angle), radius * Math.sin(angle)); // Point on the circle circumference
  shape.lineTo(0, 0); // Close the triangle back to the origin

  const geometry = new THREE.ShapeGeometry(shape);
  const mesh = new THREE.Mesh(geometry, material);

  return mesh;
}

let { sectors, sectorsGroup } = loadModel(scene);
const { parts, rotationSpeeds } = loadWheelBase(scene);
const animateParts = (parts, rotationSpeeds, deltaTime) => {
  // Go through each part and update its rotation
  parts.forEach((part, index) => {
    part.rotation.y += rotationSpeeds[index] * deltaTime;
  });
};

sectorsGroup.position.set(0, -1.1, 0);


// Animation parameters
let currentSpeed = 0.2; // initial rotation speed in radians
const deceleration = 0.001; // deceleration rate
const stopAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]; // possible stop angles in radians
let targetAngle = stopAngles[Math.floor(Math.random() * stopAngles.length)]; // pick a random stop angle

/**
 * Animate
 */
const clock = new THREE.Clock();
const tick = () => {
  // Update controls
  controls.update();
  const deltaTime = clock.getDelta();

  // Rotate the whole wheel
//   sectors.forEach((sector) => {
//     sector.rotation.y += 0.01;
//   });
if (currentSpeed > 0) {
    sectorsGroup.rotation.y += currentSpeed;
    currentSpeed -= deceleration;
    currentSpeed = Math.max(currentSpeed, 0); // prevent negative speed
  }

  // Check if we are close to the target angle and can stop
  if (currentSpeed < 0.005 && Math.abs(sectorsGroup.rotation.y % (2 * Math.PI) - targetAngle) < 0.05) {
    currentSpeed = 0; // stop the wheel
    wheel.rotation.y = targetAngle; // snap to the exact angle
  }
//   sectorsGroup.rotation.y += 0.01;


  if (parts.length > 0) {
    animateParts(parts, rotationSpeeds, deltaTime);
  }
  //   ngonGroup.rotation.z += 0.01;

  // Sine wave animation for each sector
  // sectors.forEach((sector, index) => {
  //     const sineOffset = Math.sin(time + index);
  //     sector.position.y = sineOffset * 0.314;
  // });
  // Render
  composer.render();

  window.requestAnimationFrame(tick);
};

tick();
