import * as THREE from "three"

export const mixamoRigNames = [
    "mixamorigNeck",
    "mixamorigHead",
    "mixamorigSpine",
    "mixamorigSpine1",
    "mixamorigSpine2",
    "mixamorigSpine3",
    "mixamorigLeftShoulder",
    "mixamorigLeftArm",
    "mixamorigLeftForeArm",
    "mixamorigLeftHand",
    "mixamorigRightShoulder",
    "mixamorigRightArm",
    "mixamorigRightForeArm",
    "mixamorigRightHand",
] as const

export const initialRigData = {
    "mixamorigNeck": new THREE.Object3D(),
    "mixamorigHead": new THREE.Object3D(),
    "mixamorigSpine": new THREE.Object3D(),
    "mixamorigSpine1": new THREE.Object3D(),
    "mixamorigSpine2": new THREE.Object3D(),
    "mixamorigSpine3": new THREE.Object3D(),
    "mixamorigLeftShoulder": new THREE.Object3D(),
    "mixamorigLeftArm": new THREE.Object3D(),
    "mixamorigLeftForeArm": new THREE.Object3D(),
    "mixamorigLeftHand": new THREE.Object3D(),
    "mixamorigRightShoulder": new THREE.Object3D(),
    "mixamorigRightArm": new THREE.Object3D(),
    "mixamorigRightForeArm": new THREE.Object3D(),
    "mixamorigRightHand": new THREE.Object3D(),
}
