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
    exp3.setInitialPosition(camera,-4,1,4);

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
    exp3.loadGLTF(scene, 'assets/uncompressed.gltf', camera);

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