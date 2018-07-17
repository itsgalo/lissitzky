import * as THREE from 'three';
import * as CANNON from 'cannon';

export default scene => {

	let line, mouseLine;

	let timeStep = 1 / 60;
	let bodies = [];
	let lines = [];
  let bones = [];
	//init cannon
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

	//init three materials
	const wireframe = new THREE.MeshBasicMaterial( { color: 0xff00ff, side: THREE.DoubleSide, transparent: true, opacity: 0 } );
	const material = new THREE.MeshPhongMaterial( { color: 0xffffff,  shininess: 25, overdraw: 1, side: THREE.DoubleSide } );
	const dashed = new THREE.LineDashedMaterial( { color: 0x444444, dashSize: 0.5, gapSize: 0.5, linewidth: 5, scale: 3 } );
	//add ground
	const ground =  new THREE.Mesh( new THREE.PlaneGeometry( 1000, 1000, 4, 4 ), wireframe );
	ground.rotation.x = -Math.PI/2;
	scene.add(ground);

	function addShapes(x, y, z, px, py, pz) {

		mouseLine = new THREE.Geometry();
    mouseLine.vertices.push(
       new THREE.Vector3(x, y, z),
       new THREE.Vector3(px, py, pz)
     );

    line = new THREE.Line( mouseLine, dashed );
    line.computeLineDistances();
    scene.add( line );
    lines.push(line);

	}

	function rand(min, max) {

    return Math.random() * (max - min) + min;

  }

	function extrudeLine() {
		//calculate begin and end points
    let dia = rand(0.2, 1);
    let pointA = new THREE.Vector3( mouseLine.vertices[0].x, mouseLine.vertices[0].y, mouseLine.vertices[0].z);
    let pointB = new THREE.Vector3( mouseLine.vertices[1].x, mouseLine.vertices[1].y, mouseLine.vertices[1].z );
    let rot = Math.atan2(pointB.x - pointA.x, pointB.z - pointA.z);
    let dist = pointA.distanceTo(pointB);
    let center = new CANNON.Vec3((pointA.x + pointB.x) / 2, dist/4, (pointA.z + pointB.z) / 2);
    //rotation
    let quat = new CANNON.Quaternion();
    quat.setFromAxisAngle(new CANNON.Vec3(0,1,0),rot);

    let cyl = new CANNON.Box(new CANNON.Vec3(dia / 2, dist / 4, dist / 2));
    let body = new CANNON.Body({
      mass: 0.9
    });
    body.addShape(cyl, center, quat);

    let updateCOM = function( body ) {
    //calculate the center of mass
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

    world.addBody(body);
    bodies.push(body);

    let ext = new THREE.BoxGeometry(dia, dist / 2, dist)
    let extrusion = new THREE.Mesh( ext, material );
    extrusion.rotation.y = rot;

    let blocks = new THREE.Group();
    blocks.add(extrusion);
    scene.add(blocks);
    bones.push(blocks);

	}

	function update(time) {

		world.step(timeStep);

    for (let i = 0; i < bodies.length; i++) {
      bones[i].position.copy(bodies[i].position);
      bones[i].quaternion.copy(bodies[i].quaternion);
    }

	}

	function changeGravity(x, y, z) {
		world.gravity.set(x, y, z);
	}

	function updateVerts(x, y, z) {
    mouseLine.verticesNeedUpdate = true;
    mouseLine.vertices[1].set(x, y, z);
  }

  return {
    update,
		updateVerts,
		addShapes,
		extrudeLine,
		changeGravity
  }
}
