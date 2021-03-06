import * as THREE from 'https://unpkg.com/three@0.108.0/build/three.module.js';
import {GUI} from './dat.gui.module.js';
import * as exp3 from "./3explorer.js";

function showLocalAxes(node){
    const axes = new THREE.AxesHelper();
    axes.material.depthTest = false; //Disabilità il depth test per gl'assi in modo da mostrarli anche se all'interno della mesh
    axes.renderOrder = 1; //Li renderizza con ordine 1 (di default gli oggetti hanno ordine 0), quindi dopo gli altri
    node.add(axes);
}

const originRotation = new THREE.Object3D();

let controls;

function main(){
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({canvas});
    const gui = new GUI();
    renderer.shadowMap.enabled = true;

    const fov = 75;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 10000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);



    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xAAAAAA); //Colore background

    exp3.enableControls(scene, camera, canvas);

    originRotation.position.set(0,0,0);
    scene.add(originRotation);

    let light = new THREE.AmbientLight(0xFFFFFF, 0.2);
    scene.add(light);

    //Luce punto
    {
        const color = 0xFFFFFF;
        const intensity = 1;
        light = new THREE.PointLight(color, intensity); //Default posizione e orientamento = (0,0,0)
        light.position.set(3,2.3,4); //Cambio la posizione
        light.distance = Infinity;//La luce punto ha anche la proprietà distance, se 0 è infinita, altrimenti la luce "decade" linearmente fino a distance dove è = 0
        light.castShadow = true;
        light.shadow.bias = -0.001
        light.decay = 0;
        originRotation.add(light);

        const helper = new THREE.PointLightHelper(light);
        helper.scale.set(200,200,200);
        //showLocalAxes(helper);
        scene.add(helper);

        const folder = gui.addFolder('Shadow Camera');
        folder.open();
        const minMaxGUIHelper = new MinMaxGUIHelper(light.shadow.camera, 'near', 'far', 0.1);
        folder.add(minMaxGUIHelper, 'min', 0.1, 550, 0.1).name('near').onChange(updateCamera);
        folder.add(minMaxGUIHelper, 'max', 0.1, 5000, 0.1).name('far').onChange(updateCamera);

        gui.add(light.shadow, 'bias').min(-0.01).max(0.01).step(0.00001);

    }

    //loadObj(scene, 'assets/IronMan/IronMan');
    //loadGLTF(scene, 'assets/house/scene.gltf', camera, controls);
    //exp3.loadGLTF(scene, 'assets/uncompressed.gltf', camera);

    const urlParams = new URLSearchParams(window.location.search);
    const pathParam = urlParams.get('assetPath');
    if(pathParam != null){
        let whenLoaded = () => { //TODO: usare promise
            console.log("Model loaded!");
            if(pathParam === 'tavern/scene.gltf')//tavern
            {
                exp3.moveTo(camera, 350, 172, -420); //tavern
                exp3.explorerSettings.speed = 30;
                exp3.explorerSettings.jumpSpeed = 130;
                exp3.explorerSettings.minHeight = 50;
                exp3.explorerSettings.heightFromGround = 50;
                exp3.explorerSettings.mass = 40.0;
            }
            else if(pathParam === '8gemma/scene.gltf')//8 gemma
            {
                exp3.moveTo(camera, 8, 2, -11);
                exp3.explorerSettings.speed = 5;
                exp3.explorerSettings.jumpSpeed = 20;
                exp3.explorerSettings.minHeight = 1;
                exp3.explorerSettings.heightFromGround = 1.5;
                exp3.explorerSettings.mass = 10.0;
            }
            else if(pathParam === '1diamante/pt/scene.gltf')
            {
                console.log('1diamante/pt settings');
                exp3.moveTo(camera, 7080, 100, -980);
                exp3.explorerSettings.speed = 60;
                exp3.explorerSettings.jumpSpeed = 300;
                exp3.explorerSettings.minHeight = 1;
                exp3.explorerSettings.heightFromGround = 150;
                exp3.explorerSettings.mass = 50.0;
            }
        }
        exp3.loadGLTF(scene, 'assets/'+pathParam, camera, whenLoaded);
    } else {
        let whenLoaded = () => {
            console.log("Model loaded!");
            exp3.moveTo(camera, 0,0,0); //Imposta posizione iniziale

        }
        exp3.loadGLTF(scene, 'assets/uncompressed.gltf', camera, whenLoaded);
        exp3.explorerSettings.speed = 200;
        exp3.explorerSettings.jumpSpeed = 20;
        exp3.explorerSettings.heightFromGround = 1;
        exp3.explorerSettings.mass = 10.0;
    }

    gui.add(exp3.explorerSettings, 'speed').min(1).max(100).step(1).listen();
    gui.add(exp3.explorerSettings, 'friction').min(1).max(10).step(0.5).listen();
    gui.add(exp3.explorerSettings, 'jumpSpeed').min(1).max(500).step(10).listen();
    gui.add(exp3.explorerSettings, 'minHeight').min(-100).max(100).step(1).listen();
    gui.add(exp3.explorerSettings, 'heightFromGround').min(-200).max(200).step(0.5).listen();
    gui.add(exp3.explorerSettings, 'mass').min(1).max(100).step(1).listen();

    function render(time){
        time *= 0.0006;

        exp3.doStep(scene);
        originRotation.rotation.y = time;

        //Ridimensionamento responsive del canvas
        if (resizeRendererToDisplaySize(renderer)) {
            //Se ho ridimensionato il canvas devo aggiornare l'aspect della camera
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    //Aggiorna le dimensioni del rendering del canvas a quelle effettive del canvas sulla pagina
    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }
}

function updateCamera() {
}

class MinMaxGUIHelper {
    constructor(obj, minProp, maxProp, minDif) {
        this.obj = obj;
        this.minProp = minProp;
        this.maxProp = maxProp;
        this.minDif = minDif;
    }
    get min() {
        return this.obj[this.minProp];
    }
    set min(v) {
        this.obj[this.minProp] = v;
        this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDif);
    }
    get max() {
        return this.obj[this.maxProp];
    }
    set max(v) {
        this.obj[this.maxProp] = v;
        this.min = this.min;  // this will call the min setter
    }
}

export { main };