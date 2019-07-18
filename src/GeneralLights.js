import * as THREE from 'three';

export default scene => {

	const light = new THREE.DirectionalLight( 0xffffff, 1 );
  light.position.set(-10, 10, 10);
  scene.add(light);

	function update(time) {
		//light.intensity = (Math.sin(time)+1.5)/1.5;
		//light.color.setHSL( Math.sin(time), 0.5, 0.5 );
	}

  return {
    update
  }
}
