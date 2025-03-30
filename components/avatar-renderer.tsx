"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useAtomValue } from "jotai";
import { landmarkAtom } from "@/atoms/landmarkAtom";
import { useEffect, useRef, useState } from "react";

import * as THREE from "three";
import {
  applyLeftArmRotation,
  applyNeckRotation,
  applyRightArmRotation,
} from "@/utils/calcRotation";
import { mixamoRigNames } from "@/const/mixamorigNames";
import { InitialRigRotation, Rigs } from "@/types";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

type AvatarModelProps = {
  setBones: (bones: Rigs) => void;
  setInitialRigRotations: (rotations: InitialRigRotation) => void;
};

function AvatarModel({ setBones, setInitialRigRotations }: AvatarModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load("/models/avatar.glb", (gltf) => {
      const fbx = gltf.scene;
      fbx.scale.set(2, 2, 2);
      fbx.position.set(0, 0, 0);

      const boneMap: Rigs = {} as Rigs;
      const initialRotations: InitialRigRotation = {} as InitialRigRotation;
      for (const rigName of mixamoRigNames) {
        const bone = fbx.getObjectByName(rigName);
        if (bone) {
          boneMap[rigName] = bone;
          if (rigName === "mixamorigRightArm") {
            bone.rotation.z = -Math.PI / 4;
          }
          initialRotations[rigName] = bone.quaternion.clone();
        }
      }

      setBones(boneMap);
      setInitialRigRotations(initialRotations);
      if (groupRef.current) {
        groupRef.current.add(fbx);
      }
    });
  }, [setBones, setInitialRigRotations]);

  return <group ref={groupRef} />;
}

type AvatarUpdaterProps = {
  bones: Rigs;
  initialRigRotations: InitialRigRotation;
};

function AvatarUpdater({ bones, initialRigRotations }: AvatarUpdaterProps) {
  const poseData = useAtomValue(landmarkAtom);

  useFrame(() => {
    if (!poseData || !bones["mixamorigNeck"]) return;

    applyNeckRotation(poseData, bones["mixamorigNeck"]);
    applyLeftArmRotation(
      poseData,
      {
        upperArm: bones["mixamorigLeftArm"],
        forearm: bones["mixamorigLeftForeArm"],
      },
      {
        upperArm: initialRigRotations["mixamorigLeftArm"],
        forearm: initialRigRotations["mixamorigLeftForeArm"],
      }
    );
    applyRightArmRotation(
      poseData,
      {
        upperArm: bones["mixamorigRightArm"],
        forearm: bones["mixamorigRightForeArm"],
      },
      {
        upperArm: initialRigRotations["mixamorigRightArm"],
        forearm: initialRigRotations["mixamorigRightForeArm"],
      }
    );
  });

  return null;
}

export default function AvatarRendererR3F() {
  const [bones, setBones] = useState<Rigs>({} as Rigs);
  const [initialRigRotation, setInitialRigRotation] =
    useState<InitialRigRotation>({} as InitialRigRotation);

  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 2, 7], fov: 30 }}>
        <ambientLight intensity={0.5} />
        <directionalLight intensity={2} position={[0, 10, 10]} />
        <OrbitControls target={[0, 1, 0]} />
        <AvatarModel
          setBones={setBones}
          setInitialRigRotations={setInitialRigRotation}
        />
        <AvatarUpdater bones={bones} initialRigRotations={initialRigRotation} />
      </Canvas>
    </div>
  );
}
