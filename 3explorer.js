import * as THREE from 'https://unpkg.com/three@0.108.0/build/three.module.js';

import {OBJLoader2} from 'https://unpkg.com/three@0.108.0/examples/jsm/loaders/OBJLoader2.js'
import {MTLLoader} from 'https://unpkg.com/three@0.108.0/examples/jsm/loaders/MTLLoader.js';
import {MtlObjBridge} from 'https://unpkg.com/three@0.108.0/examples/jsm/loaders/obj2/bridge/MtlObjBridge.js';

import {GLTFLoader} from 'https://unpkg.com/three@0.108.0/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://unpkg.com/three@0.108.0/examples/jsm/loaders/DRACOLoader.js';


function loadObj(scene, path){
    const objLoader = new OBJLoader2();
    const mtlLoader = new MTLLoader();
    mtlLoader.load(path+'.mtl', (mtlParseResult) => {
        const materials =  MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult);
        objLoader.addMaterials(materials);
        objLoader.load(path+'.obj', (root) => {
            scene.add(root);
        });
    });
}

function loadGLTF(scene, path, camera, controls){
    const gltfLoader = new GLTFLoader();
    var dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath( './js/libs/draco/' );
    gltfLoader.setDRACOLoader( dracoLoader );
    gltfLoader.load(path, (gltf) => {
        const root = gltf.scene;
        scene.add(root);
        root.traverse((obj) => {
            if (obj.castShadow !== undefined) {
                obj.castShadow = false;
                obj.receiveShadow = false;
            }
        });
        if(camera != undefined){
            const box = new THREE.Box3().setFromObject(root);
            const boxSize = box.getSize(new THREE.Vector3()).length();
            const boxCenter = box.getCenter(new THREE.Vector3());
            console.log('boxSize: '+boxSize);
            console.log('boxCenter: ( ' + boxCenter.x + '; ' + boxCenter.y + '; ' + boxCenter.z + ' )');
            frameArea(boxSize * 1.2, boxSize, boxCenter, camera);
            if(controls != undefined){
                controls.maxDistance = boxSize * 10;
                controls.target.copy(boxCenter);
                controls.update();
            }
        }
    });
}

function degToRad(deg){
    return deg * Math.PI / 180;
}

function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
    const halfFovY = degToRad(camera.fov * .5);
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);

    const direction = (new THREE.Vector3()).subVectors(camera.position, boxCenter).normalize();
    camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));
    camera.near = boxSize / 100;
    camera.far = boxSize * 100;

    camera.updateProjectionMatrix();
    camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
}

export {loadObj, loadGLTF};