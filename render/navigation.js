import * as THREE from 'three';

// Move camera and target together on the ground plane: distance and height stay fixed.
export function translateCamera(camera, controls, right, forward) {
  const direction = controls.target.clone().sub(camera.position);
  direction.y = 0;
  if (direction.lengthSq() < 1e-8) direction.set(0, 0, -1);
  direction.normalize();
  const sideways = new THREE.Vector3().crossVectors(direction, camera.up).normalize();
  const delta = sideways.multiplyScalar(right).addScaledVector(direction, forward);
  camera.position.add(delta);
  controls.target.add(delta);
  controls.update();
}
export function configureNavigation(controls, mode) {
  controls.screenSpacePanning = false;
  controls.enableDamping = false;
  controls.mouseButtons.LEFT = mode === 'move' ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE;
  controls.mouseButtons.RIGHT = mode === 'move' ? THREE.MOUSE.ROTATE : THREE.MOUSE.PAN;
  controls.mouseButtons.MIDDLE = THREE.MOUSE.DOLLY;
  controls.touches.ONE = mode === 'move' ? THREE.TOUCH.PAN : THREE.TOUCH.ROTATE;
  controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
}
export const streetViews = [
  {id:'north',name:'North street',position:[-45,13,-28.8],target:[0,1,-28.8]},
  {id:'upper',name:'Upper street',position:[-45,13,-2.8],target:[0,1,-2.8]},
  {id:'central',name:'Central street',position:[-45,13,23.2],target:[0,1,23.2]},
  {id:'south',name:'South street',position:[-45,13,49.2],target:[0,1,49.2]},
  {id:'entrance',name:'Entrance road',position:[0,15,61],target:[0,1,45]},
  {id:'outfall',name:'Outfall',position:[103,22,74],target:[77,1,53]}
];
