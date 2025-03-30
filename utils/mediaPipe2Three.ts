import * as THREE from 'three';

export const mpToWorld = (p: { x: number; y: number; z: number }) => {
      return new THREE.Vector3(
        (p.x - 0.5) * 2, // 中心補正 + スケーリング
        -(p.y - 0.5) * 2, // 上下反転
        -p.z * 2 // Zは奥行き
      );
    };

export const getNormalizedDirection = (from: THREE.Vector3, to: THREE.Vector3) => {
    return new THREE.Vector3().subVectors(to, from).normalize();
};
