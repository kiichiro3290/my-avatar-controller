"use client";

import { landmarkAtom } from "@/atoms/landmarkAtom";
import { initialRigData, mixamoRigNames } from "@/const/mixamorigNames";
import { Rigs } from "@/types";
import { calcNeckRotation } from "@/utils/clacRotation";
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

  const [bones, setBones] = useState<Rigs>(initialRigData);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

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
            bones[rigName] = bone;
          }
        }
        setBones(bones);
        setIsLoaded(true);
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
    camera.position.set(0, 4, 2);
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
    controls.target.set(0, 2, 0);
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
    if (!poseData || !sceneRef.current || !isLoaded) return;

    // 首ボーンに適用（ボーン名はあなたのモデルに合わせて）
    const neckRotation = calcNeckRotation(poseData);
    const neckBone = bones["mixamorigNeck"];
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
