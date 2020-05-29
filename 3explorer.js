import * as THREE from 'https://unpkg.com/three@0.108.0/build/three.module.js';
import {OBJLoader2} from 'https://unpkg.com/three@0.108.0/examples/jsm/loaders/OBJLoader2.js'
import {MTLLoader} from 'https://unpkg.com/three@0.108.0/examples/jsm/loaders/MTLLoader.js';
import {MtlObjBridge} from 'https://unpkg.com/three@0.108.0/examples/jsm/loaders/obj2/bridge/MtlObjBridge.js';

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

export {loadObj};