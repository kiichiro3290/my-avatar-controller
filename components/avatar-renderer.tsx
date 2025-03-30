"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useAtomValue } from "jotai";
import { landmarkAtom } from "@/atoms/landmarkAtom";
import { useEffect, useRef, useState } from "react";

import * as THREE from "three";
import { calcNeckRotation } from "@/utils/clacRotation";
import { mixamoRigNames } from "@/const/mixamorigNames";
import { Rigs } from "@/types";
import { FBXLoader } from "three/examples/jsm/Addons.js";

function AvatarModel({ setBones }: { setBones: (bones: Rigs) => void }) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const loader = new FBXLoader();
    loader.load("/models/avatar.fbx", (fbx) => {
      fbx.scale.set(0.01, 0.01, 0.01);
      fbx.position.set(0, 0, 0);

      const boneMap: Rigs = {} as Rigs;
      for (const rigName of mixamoRigNames) {
        const bone = fbx.getObjectByName(rigName);
        if (bone) boneMap[rigName] = bone;
      }

      setBones(boneMap);
      if (groupRef.current) {
        groupRef.current.add(fbx);
      }
    });
  }, [setBones]);

  return <group ref={groupRef} />;
}

function AvatarUpdater({ bones }: { bones: Rigs }) {
  const poseData = useAtomValue(landmarkAtom);

  useFrame(() => {
    if (!poseData || !bones["mixamorigNeck"]) return;
    const neckRot = calcNeckRotation(poseData);
    bones["mixamorigNeck"].quaternion.copy(neckRot);
  });

  return null;
}

export default function AvatarRendererR3F() {
  const [bones, setBones] = useState<Rigs>({} as Rigs);

  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 4, 2], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight intensity={1} position={[0, 10, 10]} />
        <OrbitControls target={[0, 2, 0]} />
        <AvatarModel setBones={setBones} />
        <AvatarUpdater bones={bones} />
      </Canvas>
    </div>
  );
}
