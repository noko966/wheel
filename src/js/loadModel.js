import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { materials } from "./materials";

// const modelPath = "/models/slice_8.glb";
const modelPath = "/models/slice_8_2.glb";

// const cardMaterialPath = "/models/card.jpg";
// cardMaterialMetal.encoding = THREE.sRGBEncoding;
const gltfLoader = new GLTFLoader();

export const loadModel = (scene) => {
  const sectorsGroup = new THREE.Group();

  const sectors = [];
  gltfLoader.load(modelPath, (gltf) => {
    const numberOfSectors = 12;
    const angleIncrement = (2 * Math.PI) / numberOfSectors;
    scene.add(sectorsGroup);
    // Now, clone and rotate each sector
    for (let i = 0; i < numberOfSectors; i++) {
      let sectorClone = gltf.scene.clone();

      sectorClone.traverse((child) => {
        if (child.isMesh) {
          //   const materialConfig = materials[i % 2];
          const color = new THREE.Color(
            Math.random(),
            Math.random(),
            Math.random()
          );
          child.material = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 3,
          });
          //   child.material = new THREE.MeshStandardMaterial({
          //     wireframe: false,
          //     color: materialConfig.color,
          //     emissive: materialConfig.emissive,
          //     emissiveIntensity: materialConfig.emissiveIntensity,
          //     metalness: 0.1,
          //     roughness: 0.5,
          //   });
        }
      });

      sectorClone.rotation.y = angleIncrement * i;
      sectors.push(sectorClone);
      sectorsGroup.add(sectorClone);
    }

    gltf.scene.scale.set(1, 1, 1);

    gltf.scene.position.set(0, 0, 0);
  });
  return { sectors, sectorsGroup };
};
