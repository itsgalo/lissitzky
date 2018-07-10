import React from 'react';
import * as CANNON from 'cannon';
import * as THREE from 'three';
//import orbit controls from npm
const OrbitControls = require('three-orbit-controls')(THREE);
let w = window.innerWidth;
let h = window.innerHeight;
let line, mouseLine, rays;
//begin THREE application
let drawing = false;
//CANNON vars
let timeStep = 1/60;
let bodies = [];
//Raycasting vars
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let px, py, pz;
let lines = [];
let bones = [];

class App extends React.Component {
  constructor(props) {
    super(props);

    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.animate = this.animate.bind(this);
  }
  rand = function(min, max) {
    return Math.random() * (max - min) + min;
  }
  addShapes = function(x, y, z) {

    mouseLine = new THREE.Geometry();
    mouseLine.vertices.push(
       new THREE.Vector3(x, y, z),
       new THREE.Vector3(rays.x, rays.y, rays.z)
     );

    line = new THREE.Line( mouseLine, this.dashed );
    line.computeLineDistances();
    this.scene.add( line );
    lines.push(line);
  }
  extrudeLine = function() {
    let dia = this.rand(0.2, 1);
    let pointA = new THREE.Vector3( mouseLine.vertices[0].x, mouseLine.vertices[0].y, mouseLine.vertices[0].z);
    let pointB = new THREE.Vector3( mouseLine.vertices[1].x, mouseLine.vertices[1].y, mouseLine.vertices[1].z );
    let rot = Math.atan2(pointB.x - pointA.x, pointB.z - pointA.z);
    let dist = pointA.distanceTo(pointB);
    let center = new CANNON.Vec3((pointA.x + pointB.x) / 2, dist/4, (pointA.z + pointB.z) / 2);

    let quat = new CANNON.Quaternion();
    quat.setFromAxisAngle(new CANNON.Vec3(0,1,0),rot);

    let cyl = new CANNON.Box(new CANNON.Vec3(dia / 2, dist / 4, dist / 2));
    //var cyl = new CANNON.Cylinder(dia, dia, dist, 16);
    let body = new CANNON.Body({
      mass: 0.9
    });
    body.addShape(cyl, center, quat);

    let updateCOM = function( body ) {
    //first calculate the center of mass
    let com = new CANNON.Vec3();
    body.shapeOffsets.forEach( function( offset ) {
        com.vadd( offset, com );
    });
    com.scale( 1/body.shapes.length, com );
    //move the shapes so the body origin is at the COM
    body.shapeOffsets.forEach( function( offset ) {
        offset.vsub( com, offset );
    });
    //now move the body so the shapes' net displacement is 0
    let worldCOM = new CANNON.Vec3();
    body.vectorToWorldFrame( com, worldCOM );
    body.position.vadd( worldCOM, body.position );
    };
    updateCOM(body);

    this.world.addBody(body);
    bodies.push(body);

    //curve = new THREE.LineCurve3( pointA, pointB );
    //var ext = new THREE.TubeGeometry( curve, 20, dia, 16, false );
    //var ext = new THREE.CylinderGeometry(dia, dia, dist, 32);
    let ext = new THREE.BoxGeometry(dia, dist / 2, dist)
    let extrusion = new THREE.Mesh( ext, this.material );

    let ball = new THREE.SphereGeometry(dia, 32, 32);
    //var ball = new THREE.CylinderGeometry(dia * 1.5, dia * 1.5, 0.2, 32);
    let ballA = new THREE.Mesh(ball, this.material);
    let ballB = new THREE.Mesh(ball, this.material);
    ballA.position.y = -dist / 2;
    ballB.position.y = dist / 2;
    extrusion.rotation.y = rot;

    let balls = new THREE.Group();
    balls.add(extrusion);
    //balls.add( ballA );
    //balls.add( ballB );
    this.scene.add(balls);
    bones.push(balls);
  }
  componentDidMount() {

    const world = new CANNON.World();
    world.gravity.set(0,0,0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;

    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({ mass: 0 });
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    groundBody.position.set(0, -2, 0);
    groundBody.addShape(groundShape);
    world.addBody(groundBody);

    this.world = world;
    this.timeStep = timeStep;

    //init THREE
    const scene = new THREE.Scene();
    let aspect = w / h;
    const camera = new THREE.OrthographicCamera(
      20 * aspect / -2,
      20 * aspect / 2,
      20 / 2,
      20 / -2,
      -1000,
      3000
    );
    camera.position.set(-100, 100, 100);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    const wireframe = new THREE.MeshBasicMaterial( { color: 0xff00ff, side: THREE.DoubleSide, transparent: true, opacity: 0 } );
    const material = new THREE.MeshPhongMaterial( { color: 0xffffff,  shininess: 25, overdraw: 1, side: THREE.DoubleSide } );
    const dashed = new THREE.LineDashedMaterial( { color: 0x000000, dashSize: 0.5, gapSize: 0.5, linewidth: 5, scale: 3 } );
    const controls = new OrbitControls( camera );
    controls.enableRotate = false;

    const ground =  new THREE.Mesh( new THREE.PlaneGeometry( 100, 100, 4, 4 ), wireframe );
    ground.rotation.x = -Math.PI/2;
    scene.add(ground);

    const directionalLight = 	new THREE.DirectionalLight( 0xff7130 );
    directionalLight.position.x = -10;
    directionalLight.position.y = 10;
    directionalLight.position.z = 10;
    directionalLight.position.normalize();
    scene.add( directionalLight );

    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.material = material;
    this.controls = controls;
    this.dashed = dashed;

    controls.update();

    this.mount.appendChild(this.renderer.domElement);
    this.start();

  }
  updateVerts = function(x, y, z) {
    mouseLine.verticesNeedUpdate = true;
    mouseLine.vertices[1].set(x, y, z);
  }
  move(e) {
    e.preventDefault();
    mouse.x = ( e.clientX / w ) * 2 - 1;
    mouse.y = - ( e.clientY / h ) * 2 + 1;
    if(drawing === true) {
      this.updateVerts(rays.x, rays.y, rays.z);
    }
  }
  down(e) {
    e.preventDefault();
    px = rays.x;
    py = rays.y;
    pz = rays.z;
    drawing = true;
    this.addShapes(px, py, pz);
  }
  up(e) {
    e.preventDefault();
    drawing = false;
    this.extrudeLine();
    this.scene.remove(line);
  }
  componentWillUnmount() {
    this.stop();
    this.mount.removeChild(this.renderer.domElement);
  }

  start() {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate);
    }
  }

  stop() {
    cancelAnimationFrame(this.frameId);
  }

  animate() {
    this.world.step(this.timeStep);
    for (var i = 0; i < bodies.length; i++) {
      bones[i].position.copy(bodies[i].position);
      bones[i].quaternion.copy(bodies[i].quaternion);
    }
    this.renderScene();
    this.frameId = window.requestAnimationFrame(this.animate);
  }

  renderScene() {
    raycaster.setFromCamera(mouse, this.camera);
    let intersects = raycaster.intersectObjects(this.scene.children);
    for ( let i = 0; i < intersects.length; i++ ) {
      rays = intersects[i].point;
    }
    this.renderer.render(this.scene, this.camera);
  }

  render() {
    return (
      <div
        onMouseMove = {this.move.bind(this)}
        onMouseDown = {this.down.bind(this)}
        onMouseUp = {this.up.bind(this)}
        style={{ width: w, height: h }}
        ref={(mount) => { this.mount = mount }}
      />
    )
  }
}

export default App;
