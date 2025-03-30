"use client";

import { landmarkAtom } from "@/atoms/landmarkAtom";
import { mixamoRigNames } from "@/const/mixamorigNames";
import { mpToWorld, getNormalizedDirection } from "@/utils/mediaPipe2Three";
import { useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { FBXLoader } from "three/examples/jsm/Addons.js";

export default function AvatarRenderer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const poseData = useAtomValue(landmarkAtom);

  const [bones, setBones] = useState<THREE.Object3D[]>([]);

  useEffect(() => {
    const loader = new FBXLoader();
    loader.load(
      "/models/avatar.fbx",
      (fbx) => {
        fbx.scale.set(0.01, 0.01, 0.01); // スケール調整（必要に応じて）
        fbx.position.set(0, 0, 0); // ポジション調整

        console.log("FBX loaded:", fbx);

        // fbx アニメーションがある場合の処理（任意）
        const mixer = new THREE.AnimationMixer(fbx);
        if (fbx.animations.length > 0) {
          const action = mixer.clipAction(fbx.animations[0]);
          action.play();
        }

        // fbxオブジェクトを参照するためにrefやstateに保存したいならここで保存する
        sceneRef.current?.add(fbx);

        for (const rigName of mixamoRigNames) {
          const bone = fbx.getObjectByName(rigName);
          if (bone) {
            bones.push(bone);
          }
        }
      },
      undefined,
      (error) => {
        console.error("FBX load error:", error);
      }
    );
  }, []);

  // Create a simple avatar with spheres and cylinders
  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js scene
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 10, 10);
    scene.add(directionalLight);

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.5, 3);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvas,
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1, 0);
    controls.update();

    // Animation loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);

      if (rendererRef.current && cameraRef.current) {
        rendererRef.current.render(scene, cameraRef.current);
      }
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current)
        return;

      cameraRef.current.aspect =
        containerRef.current.clientWidth / containerRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
    };

    window.addEventListener("resize", handleResize);

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frameIdRef.current);
    };
  }, []);

  // Update avatar pose based on pose data
  useEffect(() => {
    if (!poseData || !sceneRef.current || bones.length <= 0) return;

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

    // 首ボーンに適用（ボーン名はあなたのモデルに合わせて）
    const neckBone = bones.find(
      (bone) => bone.name === "mixamorigNeck" // MixamoのFBXの場合
    );
    if (neckBone) {
      neckBone.quaternion.copy(neckRotation);
    }
  }, [poseData]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" id="preview-avatar" />
    </div>
  );
}
