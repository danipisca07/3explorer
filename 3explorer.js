import * as THREE from 'https://unpkg.com/three@0.108.0/build/three.module.js';
import { PointerLockControls } from 'https://unpkg.com/three@0.108.0/examples/jsm/controls/PointerLockControls.js';

import {OBJLoader2} from 'https://unpkg.com/three@0.108.0/examples/jsm/loaders/OBJLoader2.js'
import {MTLLoader} from 'https://unpkg.com/three@0.108.0/examples/jsm/loaders/MTLLoader.js';
import {MtlObjBridge} from 'https://unpkg.com/three@0.108.0/examples/jsm/loaders/obj2/bridge/MtlObjBridge.js';

import {GLTFLoader} from 'https://unpkg.com/three@0.108.0/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://unpkg.com/three@0.108.0/examples/jsm/loaders/DRACOLoader.js';

/*
Model loaders
 */
let modelRoot;
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

function loadGLTF(scene, path, opt_camera, opt_callback){
    const gltfLoader = new GLTFLoader();
    var dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath( './js/libs/draco/' );
    gltfLoader.setDRACOLoader( dracoLoader );
    gltfLoader.load(path, (gltf) => {
        modelRoot = gltf.scene;
        scene.add(modelRoot);
        modelRoot.children.forEach((obj) => {
            if (obj.castShadow !== undefined) {
                obj.castShadow = true;
                obj.receiveShadow = true;
            }
        });
        if(opt_camera != undefined){
            const box = new THREE.Box3().setFromObject(modelRoot);
            const boxSize = box.getSize(new THREE.Vector3()).length();
            const boxCenter = box.getCenter(new THREE.Vector3());
            console.log('boxSize: '+boxSize);
            console.log('boxCenter: ( ' + boxCenter.x + '; ' + boxCenter.y + '; ' + boxCenter.z + ' )');
            frameArea(boxSize * 1.2, boxSize, boxCenter, opt_camera);
        }
        if(opt_callback !== undefined){
            opt_callback();
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

/*
CONTROLS
 */
let controls;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
const explorerSettings = {
    heightFromGround : 50,
    speed : 2000,
    jumpSpeed : 210.0,
    mass : 36.0,
};
let prevTime = performance.now();
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, explorerSettings.heightFromGround );
function enableControls (scene, camera, canvas){
    controls = new PointerLockControls( camera, canvas );
    canvas.addEventListener('mousedown', () =>{
        if(!controls.isLocked)
            controls.lock();
    });
    canvas.addEventListener('mouseup', () => {
        //controls.unlock();
    });

    controls.addEventListener( 'lock', function () {
        //console.log("lock");
    } );

    controls.addEventListener( 'unlock', function () {
        //console.log("unlock");
        moveForward = moveBackward = moveLeft = moveRight = false;
    } );
    scene.add(controls.getObject());
}


function moveTo(camera,x,y,z){
    camera.position.set(x,y,z);
}
function keyDownHandler (event){
    switch ( event.keyCode ) {

        case 38: // up
        case 87: // w
            moveForward = true;
            break;

        case 37: // left
        case 65: // a
            moveLeft = true;
            break;

        case 40: // down
        case 83: // s
            moveBackward = true;
            break;

        case 39: // right
        case 68: // d
            moveRight = true;
            break;

        case 32: // space
            if ( canJump === true ) velocity.y += explorerSettings.jumpSpeed;
            canJump = false;
            break;

        case 80: //p
            console.log('Current position: (' + controls.getObject().position.x + ';' + controls.getObject().position.y + ';' + controls.getObject().position.z+')');
            break;

        default:
            console.log('Unhandled key: ' + event.keyCode);
            break;

    }
}
function keyUpHandler( event ) {

    switch ( event.keyCode ) {

        case 38: // up
        case 87: // w
            moveForward = false;
            break;

        case 37: // left
        case 65: // a
            moveLeft = false;
            break;

        case 40: // down
        case 83: // s
            moveBackward = false;
            break;

        case 39: // right
        case 68: // d
            moveRight = false;
            break;

    }

}
document.addEventListener( 'keydown', keyDownHandler, false );
document.addEventListener( 'keyup', keyUpHandler, false );


function doStep(scene){
    let groundPoint;
    var time = performance.now();
    var delta = ( time - prevTime ) / 1000;

    velocity.x -= velocity.x * explorerSettings.mass * delta;
    velocity.z -= velocity.z * explorerSettings.mass * delta;

    velocity.y -= 9.8 * explorerSettings.mass * delta; // 100.0 = mass

    direction.z = Number( moveForward ) - Number( moveBackward );
    direction.x = Number( moveRight ) - Number( moveLeft );
    direction.normalize(); // this ensures consistent movements in all directions

    if ( moveForward || moveBackward ) velocity.z -= direction.z * explorerSettings.speed * delta;
    if ( moveLeft || moveRight ) velocity.x -= direction.x * explorerSettings.speed * delta;

    controls.moveRight( - velocity.x * delta );
    controls.moveForward( - velocity.z * delta );

    let intersections;
    if(modelRoot != undefined){
        raycaster.ray.origin.copy( controls.getObject().position )
        intersections = raycaster.intersectObject(scene, true ); //TODO: ottimizza con un ciclo ricorsivo su ogni oggetto della scena e ti fermi al
    }

    controls.getObject().position.y += ( velocity.y * delta ); // new behavior

    if(intersections !== undefined && intersections.length > 0 && controls.getObject().position.y - explorerSettings.heightFromGround<intersections[0].point.y)
    {
        console.log(intersections.length);
        velocity.y = Math.max( 0, velocity.y );
        controls.getObject().position.y = intersections[0].point.y + explorerSettings.heightFromGround;
        canJump = true;
    }else if(controls.getObject().position.y < explorerSettings.heightFromGround ) {
        velocity.y = 0;
        controls.getObject().position.y = explorerSettings.heightFromGround;
        canJump = true;
    }


    prevTime = time;
};

export {loadObj, loadGLTF, enableControls, doStep, moveTo, explorerSettings};