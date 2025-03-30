import { LandMarks } from "@/types";
import { getNormalizedDirection, mpToWorld } from "./mediaPipe2Three";

import * as THREE from "three";

export const calcNeckRotation = (poseData: LandMarks) => {
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

  return neckRotation;
};
