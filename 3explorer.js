import * as THREE from 'https://unpkg.com/three@0.108.0/build/three.module.js';
import {OrbitControls} from 'https://unpkg.com/three@0.108.0/examples/jsm/controls/OrbitControls.js';
function main(){
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({canvas});

    const fov = 75;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 5;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2;

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

    function makeInstance(geometry, color, posX){
        const material = new THREE.MeshPhongMaterial({color});
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        mesh.position.x = posX;
        return mesh;
    }

    //Cubi
    let cubes;
    {
        const boxWidth = 1;
        const boxHeight = 1;
        const boxDepth = 1;
        const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

        cubes = [
            makeInstance(geometry, 0x44aa88,  0),
            makeInstance(geometry, 0x8844aa, -2),
            makeInstance(geometry, 0xaa8844,  2),
        ];
    }

    function render(time){
        time *= 0.001;

        //Ridimensionamento responsive del canvas
        if (resizeRendererToDisplaySize(renderer)) {
            //Se ho ridimensionato il canvas devo aggiornare l'aspect della camera
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        cubes.forEach((cube, ndx) => { //Animazione con velocità differente per ogni cubo
            const speed = 1 + ndx * .1;
            const rot = time * speed;
            cube.rotation.x = rot;
            cube.rotation.y = rot;
        });

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