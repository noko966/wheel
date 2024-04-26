import './style.css'
import * as THREE from 'three'
import {
    OrbitControls
} from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import gsap from 'gsap'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';


import waterVertexShader from './shaders/fire/vertex.glsl'
import waterFragmentShader from './shaders/fire/fragment.glsl'


import {
    GLTFLoader
} from 'three/examples/jsm/loaders/GLTFLoader';



// import sphere from '../static/models/sphere2.glb'
// import spaceTexture from '../static/models/space2.jpg'

const modelPath = '/models/slice_8_2.glb'

const cardMaterialPath = '/models/card.jpg'
// const cardMaterialRoughPath = '/models/card_mat_rough.jpg'
// const cardMaterialMetalPath = '/models/card_mat_metal.jpg'

const cardMaterialRoughPath = '/models/card_mat_metal.jpg'
const cardMaterialMetalPath = '/models/card_mat_rough.jpg'
// const aoMapPath = '/models/card_mat_rough.jpg'

// const cardMaterial = new THREE.TextureLoader().load( cardMaterialPath );
const cardMaterial = new THREE.MeshStandardMaterial();
// const cardMaterialRough = new THREE.TextureLoader().load( cardMaterialRoughPath );
// const cardMaterialMetal = new THREE.TextureLoader().load( cardMaterialMetalPath );
// const aoMap = new THREE.TextureLoader().load( aoMapPath );
// aoMap.encoding = THREE.sRGBEncoding;
// cardMaterialRough.encoding = THREE.sRGBEncoding;
// cardMaterialMetal.encoding = THREE.sRGBEncoding;

// cardMaterial.encoding = THREE.sRGBEncoding;
let sectors = []

const urls = [
    new THREE.TextureLoader().load('/models/px.jpg'), new THREE.TextureLoader().load('/models/nx.jpg'),
    new THREE.TextureLoader().load('/models/py.jpg'), new THREE.TextureLoader().load('/models/ny.jpg'),
    new THREE.TextureLoader().load('/models/pz.jpg'), new THREE.TextureLoader().load('/models/nz.jpg')
];



// Debug
const gui = new dat.GUI({
    width: 340
})



const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x000000);

let sceneMaterial


let composer



/**
 * Lights
 */

let ax = new THREE.AxesHelper(50)
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
scene.add(light)


scene.add(ambientLight)



//Color
debugObject.debthColor = '#186691'
debugObject.surfaceColor = '#9bd8ff'

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// camera.position.set(0, 0, 15); 
camera.position.set(0, -20, 15)

camera.lookAt(scene.position);

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.toneMapping = THREE.ReinhardToneMapping;
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// renderer.antialias = true;

const params = {
    threshold: 0.1,
    strength: 0.8,
    radius: 0,
    exposure: 1
};
const renderScene = new RenderPass( scene, camera );
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
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

function createNgonSegment(innerRadius, outerRadius, segmentAngle, totalSegments, material) {
    const shape = new THREE.Shape();
    const segmentHalfAngle = segmentAngle / 2;

    // Calculate the corners of the segment
    const outerCorner1 = new THREE.Vector2(outerRadius * Math.cos(-segmentHalfAngle), outerRadius * Math.sin(-segmentHalfAngle));
    const outerCorner2 = new THREE.Vector2(outerRadius * Math.cos(segmentHalfAngle), outerRadius * Math.sin(segmentHalfAngle));
    const innerCorner1 = new THREE.Vector2(innerRadius * Math.cos(-segmentHalfAngle), innerRadius * Math.sin(-segmentHalfAngle));
    const innerCorner2 = new THREE.Vector2(innerRadius * Math.cos(segmentHalfAngle), innerRadius * Math.sin(segmentHalfAngle));

    // Define the shape's corners
    shape.moveTo(innerCorner1.x, innerCorner1.y);
    shape.lineTo(outerCorner1.x, outerCorner1.y);
    shape.lineTo(outerCorner2.x, outerCorner2.y);
    shape.lineTo(innerCorner2.x, innerCorner2.y);
    shape.lineTo(innerCorner1.x, innerCorner1.y);



    // Create geometry and mesh with the defined shape and material
    const geometry = new THREE.ShapeGeometry(shape);
    const mesh = new THREE.Mesh(geometry, material);

    return mesh;
}

const numberOfSlices = 8; // n in ngon, adjust as needed
const outerRadius = 12;
const innerRadius = 2; // Adjust as needed to control the size of the inner circle
const segmentAngle = (2 * Math.PI) / numberOfSlices;

const ngonGroup = new THREE.Group();  // Create a group for all slices
scene.add(ngonGroup);  // Add the group to the scene

const materials = [
    {
        color: 0x65f406, // Neon Red
        emissive: 0x65f406,
        emissiveIntensity: 2
    },
    {
        color: 0xffb700, // Neon Blue
        emissive: 0xffb700,
        emissiveIntensity: 1
    }
];

for (let i = 0; i < numberOfSlices; i++) {
    const materialConfig = materials[i % 2];
    const sectorMaterial = new THREE.MeshStandardMaterial({
        // wireframe: true,
        color: materialConfig.color,
        emissive: materialConfig.emissive,
        emissiveIntensity: materialConfig.emissiveIntensity,
    });
    const ngonSegment = createNgonSegment(innerRadius, outerRadius, segmentAngle, numberOfSlices, sectorMaterial);
    ngonSegment.rotation.z = segmentAngle * i; // Rotate each segment to its correct position
    // ngonSegment.position.z = segmentAngle * i; // Rotate each segment to its correct position

    ngonGroup.add(ngonSegment);

}


// const gltfLoader = new GLTFLoader();
// gltfLoader.load(
//     modelPath,
//     (gltf) => {
//         const numberOfSectors = 8;
//         const angleIncrement = (2 * Math.PI) / numberOfSectors;

        

//         // Now, clone and rotate each sector
//         for (let i = 0; i < numberOfSectors; i++) {
//             let sectorClone = gltf.scene.clone();

//             sectorClone.traverse((child) => {
//                 if (child.isMesh) {
//                     const materialConfig = materials[i % 2]; // Use modulo 2 to alternate between gold and silver
//                     child.material = new THREE.MeshStandardMaterial({
//                         wireframe:true,
//                         color: materialConfig.color,
//                         emissive: materialConfig.emissive,
//                         emissiveIntensity: materialConfig.emissiveIntensity,
//                         metalness: 0.1,
//                         roughness: 0.5
//                     });
//                 }
//             });

//             sectorClone.rotation.y = angleIncrement * i;
//             sectors.push(sectorClone);
//             scene.add(sectorClone);
//         }

//         gltf.scene.scale.set(1, 1, 1)

//         gltf.scene.rotation.set(0, 0, 0)

//         // scene.add(gltf.scene);

//     }
// )


/**
 * Animate
 */


const tick = () => {

    // Update controls
    controls.update()
    const time = Date.now() * 0.001; // Current time in seconds

    // Rotate the whole wheel
    sectors.forEach(sector => {
        // sector.rotation.y += 0.01;
    });
    ngonGroup.rotation.z += 0.01;

    // Sine wave animation for each sector
    // sectors.forEach((sector, index) => {
    //     const sineOffset = Math.sin(time + index);
    //     sector.position.y = sineOffset * 0.314;
    // });
    // Render
    composer.render();

    window.requestAnimationFrame(tick)
}

tick()
















