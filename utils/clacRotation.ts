import { LandMark } from "@/types";
import { getNormalizedDirection, mpToWorld } from "./mediaPipe2Three";

import * as THREE from "three";

export const calcNeckRotation = (poseData: LandMark[]) => {
  // ランドマーク（MediaPipe） → Three.jsにマッピング
  const leftShoulder = mpToWorld(
    poseData.filter((l) => l.name === "left_shoulder")[0]
  );
  const rightShoulder = mpToWorld(
    poseData.filter((l) => l.name === "right_shoulder")[0]
  );
  const nose = mpToWorld(poseData.filter((l) => l.name === "nose")[0]);

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
