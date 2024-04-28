import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { materials } from "./materials";

const modelPath = "/models/wheel_base.glb";

const gltfLoader = new GLTFLoader();

export const loadWheelBase = (scene) => {
  const parts = [];
  const rotationSpeeds = []; // Array to hold the rotation speeds of each part

  gltfLoader.load(modelPath, (gltf) => {
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        // Assign a random color to each mesh
        const color = new THREE.Color(
          Math.random(),
          Math.random(),
          Math.random()
        );
        child.material = new THREE.MeshStandardMaterial({
          color: color,
          emissive: color,
          emissiveIntensity: 0.2,
        });

        // Store the part and its unique rotation speed
        parts.push(child);
        rotationSpeeds.push(Math.random() * 5 + 3); // Random speed between 0.001 and 0.006
      }
    });

    scene.add(gltf.scene);
    gltf.scene.position.set(0, 0, 0);
  });

  // Return an object containing the parts and their respective rotation speeds
  return { parts, rotationSpeeds };
};
