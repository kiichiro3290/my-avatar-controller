import { LandMarks } from "@/types";
import { getNormalizedDirection, mpToWorld } from "./mediaPipe2Three";

import * as THREE from "three";

export const applyNeckRotation = (poseData: LandMarks, neckBone: THREE.Object3D) => {
  // ランドマーク（MediaPipe） → Three.jsにマッピング
  const leftShoulder = mpToWorld(
    poseData['left_shoulder']
  );
  const rightShoulder = mpToWorld(
    poseData['right_shoulder']
  );
    const nose = mpToWorld(
        poseData['nose']
    );

  // 肩の中心（≒首の付け根）
  const neckBase = new THREE.Vector3()
    .addVectors(leftShoulder, rightShoulder)
    .multiplyScalar(0.5);

  // 顔の向き（首の回転方向）＝首の付け根 → 鼻
  const faceDirection = getNormalizedDirection(neckBase, nose);

  // 初期の首の向き（例：Z方向を向いていたと仮定）
  const defaultDirection = new THREE.Vector3(0, 0, 1);

  // クォータニオンで回転を計算
  const neckRotation = new THREE.Quaternion().setFromUnitVectors(
    defaultDirection,
    faceDirection
  );

  // 首の回転を適用
  neckBone.quaternion.slerp(neckRotation, 0.2);
};

const computeBoneRotation = (
  from: THREE.Vector3,
  to: THREE.Vector3,
  initialDirection: THREE.Vector3 = new THREE.Vector3(0, -1, 0)
): THREE.Quaternion => {
  const direction = new THREE.Vector3().subVectors(to, from).normalize();
  return new THREE.Quaternion().setFromUnitVectors(initialDirection, direction);
};


export const applyLeftArmRotation = (poseData: LandMarks, bones: {
  upperArm: THREE.Object3D;
  forearm: THREE.Object3D;
}, initialRotations: {
  upperArm: THREE.Quaternion;
  forearm: THREE.Quaternion;
}) => {
  const shoulder = mpToWorld(
    poseData['left_shoulder']
  );
  const elbow = mpToWorld(
    poseData['left_elbow']
  );
  const wrist = mpToWorld(
    poseData['left_wrist']
  );

  const defaultDir = new THREE.Vector3(0, -1, 0)

  const upperArmRotation = computeBoneRotation(shoulder, elbow, defaultDir);
  upperArmRotation.multiply(initialRotations.upperArm)
  const forearmRotation = computeBoneRotation(elbow, wrist, defaultDir);
  forearmRotation.multiply(initialRotations.forearm)
  bones.upperArm.quaternion.slerp(upperArmRotation, 0.2);
  bones.forearm.quaternion.slerp(forearmRotation, 0.2);
}

export const applyRightArmRotation = (poseData: LandMarks, bones: {
  upperArm: THREE.Object3D;
  forearm: THREE.Object3D;
}, initialRotations: {
  upperArm: THREE.Quaternion;
  forearm: THREE.Quaternion;
}) => {
  const shoulder = mpToWorld(
    poseData['right_shoulder']
  );
  const elbow = mpToWorld(
    poseData['right_elbow']
  );
  const wrist = mpToWorld(
    poseData['right_wrist']
  );

  const defaultDir = new THREE.Vector3(0, -1, 0)

  const upperArmRotation = computeBoneRotation(shoulder, elbow, defaultDir);
  upperArmRotation.multiply(initialRotations.upperArm)
  const forearmRotation = computeBoneRotation(elbow, wrist, defaultDir);
  forearmRotation.multiply(initialRotations.forearm)
  bones.upperArm.quaternion.slerp(upperArmRotation, 0.2);
  bones.forearm.quaternion.slerp(forearmRotation, 0.2);
}
