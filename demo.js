import * as THREE from 'https://unpkg.com/three@0.108.0/build/three.module.js';
import {OrbitControls} from 'https://unpkg.com/three@0.108.0/examples/jsm/controls/OrbitControls.js';
import { loadObj, loadGLTF, frameArea } from "./3explorer.js";

function main(){
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({canvas});

    const fov = 75;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 10, 0);
    controls.update();


    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xAAAAAA); //Colore background

    //Luce direzionale
    {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity); //Default posizione e orientamento = (0,0,0)
        light.position.set(-1, 2, 4); //Cambio la posizione
        scene.add(light);
    }

    //loadObj(scene, 'assets/IronMan/IronMan');
    loadGLTF(scene, 'assets/house/scene.gltf', camera);

    function render(time){
        time *= 0.001;

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
export { main };