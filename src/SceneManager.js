import * as THREE from 'three';

import SceneSubject from './SceneSubject';
import GeneralLights from './GeneralLights';
const OrbitControls = require('three-orbit-controls')(THREE);

//canvas is another name for scene params, as in "this takes in a canvas"
//this exports a function containing all three scene elements
export default canvas => {

  const clock = new THREE.Clock();
  const screenDims = { width: window.innerWidth, height: window.innerHeight };

  const scene = buildScene();
  const renderer = buildRender(screenDims);
  const camera = buildCamera(screenDims);
  const sceneSubjects = createSceneSubjects(scene);

  const raycaster = new THREE.Raycaster();
  const controls = new OrbitControls( camera, renderer.domElement );
  controls.enableRotate = false;


  let rays;
  let drawing = false;
  //three vars
  let mouse = new THREE.Vector2();
  let px, py, pz;
  let bool = false;

  function buildScene() {

    const scene = new THREE.Scene();

    return scene;
  }

  function buildRender({width, height}) {

    const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true, alpha: true});
    renderer.setSize(width, height);

    return renderer;
  }

  function buildCamera({width, height}) {

    const aspectRatio = width / height;
    const nearPlane = -1000;
    const farPlane = 3000;
    const camera = new THREE.OrthographicCamera(
      20*aspectRatio / -2,
      20*aspectRatio / 2,
      20 / 2,
      20 / -2,
      nearPlane,
      farPlane
    );
    //cam must be far enough for raycasting
    camera.position.set(-100, 100, 100);
    camera.lookAt(0, 0, 0);
    return camera;
  }

  function createSceneSubjects() {

    const sceneSubjects = [
      new GeneralLights(scene),
      new SceneSubject(scene)
    ];

    return sceneSubjects;
  }

  function update() {

    const elapsedTime = clock.getElapsedTime();

    for(let i = 0; i < sceneSubjects.length; i++) {
      sceneSubjects[i].update(elapsedTime);
    }
    renderer.render(scene, camera);

  }

  function onDown(clientX, clientY) {
    drawing = true;
    updateMouse(clientX, clientY);
    updateRays();
    px = rays.x;
    py = rays.y;
    pz = rays.z;
    sceneSubjects[1].addShapes(px, py, pz, px, py, pz);
  }

  function onUp(clientX, clientY) {
    drawing = false;
    sceneSubjects[1].extrudeLine();
    scene.remove(sceneSubjects[1].lines);
  }

  function onMove(clientX, clientY) {
    updateMouse(clientX, clientY);
    updateRays();
    if (drawing === true) {
      sceneSubjects[1].updateVerts(rays.x, rays.y, rays.z);
    }
  }

  function onKey() {
    if (!bool) {
      sceneSubjects[1].changeGravity(0, -10, 0);
      bool = true;
    } else if (bool) {
      sceneSubjects[1].changeGravity(0, 0, 0);
      bool = false;
    }
  }

  function updateRays() {

    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects(scene.children);
    for ( let i = 0; i < intersects.length; i++ ) {
      rays = intersects[i].point;
    }

  }

  function updateMouse(clientX, clientY) {
    mouse.x = ( clientX / screenDims.width ) * 2 - 1;
    mouse.y = - ( clientY / screenDims.height ) * 2 + 1;
  }
  function onWindowResize() {

    const { width, height } = canvas;

    screenDims.width = width;
    screenDims.height = height;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);

  }

  return {
    update,
    renderer,
    onWindowResize,
    onDown,
    onUp,
    onMove,
    onKey
  }
}
