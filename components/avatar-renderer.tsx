"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { FBXLoader } from "three/examples/jsm/Addons.js";

interface PoseLandmark {
  x: number;
  y: number;
  z?: number;
  score?: number;
  name?: string;
}

interface AvatarRendererProps {
  poseData: PoseLandmark[];
}

export default function AvatarRenderer({ poseData }: AvatarRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number>(0);

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
    const canvas = document.getElementById(
      "preview-avatar"
    ) as HTMLCanvasElement;
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
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1, 0);
    controls.update();

    // Create a simple avatar with spheres for joints
    const createJoint = (color = 0xff0000) => {
      const geometry = new THREE.SphereGeometry(0.05, 16, 16);
      const material = new THREE.MeshStandardMaterial({ color });
      return new THREE.Mesh(geometry, material);
    };

    // Create limbs with cylinders
    const createLimb = (color = 0x0000ff) => {
      const geometry = new THREE.CylinderGeometry(0.02, 0.02, 1, 8);
      geometry.translate(0, 0.5, 0); // Move origin to bottom
      geometry.rotateX(Math.PI / 2); // Align with Z-axis
      const material = new THREE.MeshStandardMaterial({ color });
      return new THREE.Mesh(geometry, material);
    };

    // Create joints
    const joints: { [key: string]: THREE.Mesh } = {};
    const limbs: { [key: string]: THREE.Mesh } = {};

    // Create all joints
    const jointNames = [
      "nose",
      "left_eye",
      "right_eye",
      "left_ear",
      "right_ear",
      "left_shoulder",
      "right_shoulder",
      "left_elbow",
      "right_elbow",
      "left_wrist",
      "right_wrist",
      "left_hip",
      "right_hip",
      "left_knee",
      "right_knee",
      "left_ankle",
      "right_ankle",
    ];

    jointNames.forEach((name) => {
      joints[name] = createJoint();
      scene.add(joints[name]);
    });

    // Create limbs
    const limbConnections = [
      ["left_shoulder", "left_elbow"],
      ["left_elbow", "left_wrist"],
      ["right_shoulder", "right_elbow"],
      ["right_elbow", "right_wrist"],
      ["left_shoulder", "left_hip"],
      ["right_shoulder", "right_hip"],
      ["left_hip", "left_knee"],
      ["left_knee", "left_ankle"],
      ["right_hip", "right_knee"],
      ["right_knee", "right_ankle"],
      ["left_shoulder", "right_shoulder"],
      ["left_hip", "right_hip"],
    ];

    limbConnections.forEach(([from, to]) => {
      const limbName = `${from}_to_${to}`;
      limbs[limbName] = createLimb();
      scene.add(limbs[limbName]);
    });

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
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, []);

  // Update avatar pose based on pose data
  useEffect(() => {
    if (!poseData || !sceneRef.current) return;

    // Get all meshes from the scene
    const joints: { [key: string]: THREE.Mesh } = {};
    const limbs: { [key: string]: THREE.Mesh } = {};

    sceneRef.current.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        // Identify joints and limbs based on their geometry
        if (object.geometry instanceof THREE.SphereGeometry) {
          // This is a joint
          const name = object.name || `joint_${Object.keys(joints).length}`;
          object.name = name;
          joints[name] = object;
        } else if (object.geometry instanceof THREE.CylinderGeometry) {
          // This is a limb
          const name = object.name || `limb_${Object.keys(limbs).length}`;
          object.name = name;
          limbs[name] = object;
        }
      }
    });

    // Create a map of keypoints by name
    const keypointMap = new Map(poseData.map((kp) => [kp.name, kp]));

    // Update joint positions
    for (const [name, joint] of Object.entries(joints)) {
      const keypoint = keypointMap.get(name);
      if (keypoint && keypoint.score && keypoint.score > 0.3) {
        // Convert from pixel coordinates to 3D space
        // This is a simplified mapping - you'd need to adjust based on your scene scale
        const x = (keypoint.x / 640 - 0.5) * 2;
        const y = -(keypoint.y / 480 - 0.5) * 2;
        const z = 0; // We don't have reliable z-depth from 2D pose estimation

        joint.position.set(x, y, z);
        joint.visible = true;
      } else {
        joint.visible = false;
      }
    }

    // Update limb positions and orientations
    const limbConnections = [
      ["left_shoulder", "left_elbow"],
      ["left_elbow", "left_wrist"],
      ["right_shoulder", "right_elbow"],
      ["right_elbow", "right_wrist"],
      ["left_shoulder", "left_hip"],
      ["right_shoulder", "right_hip"],
      ["left_hip", "left_knee"],
      ["left_knee", "left_ankle"],
      ["right_hip", "right_knee"],
      ["right_knee", "right_ankle"],
      ["left_shoulder", "right_shoulder"],
      ["left_hip", "right_hip"],
    ];

    limbConnections.forEach(([fromName, toName], index) => {
      const fromKeypoint = keypointMap.get(fromName);
      const toKeypoint = keypointMap.get(toName);

      if (
        fromKeypoint &&
        toKeypoint &&
        fromKeypoint.score &&
        toKeypoint.score &&
        fromKeypoint.score > 0.3 &&
        toKeypoint.score > 0.3
      ) {
        // Convert from pixel coordinates to 3D space
        const fromX = (fromKeypoint.x / 640 - 0.5) * 2;
        const fromY = -(fromKeypoint.y / 480 - 0.5) * 2;
        const fromZ = 0;

        const toX = (toKeypoint.x / 640 - 0.5) * 2;
        const toY = -(toKeypoint.y / 480 - 0.5) * 2;
        const toZ = 0;

        // Find the limb
        const limbName = `${fromName}_to_${toName}`;
        const limb = limbs[limbName] || limbs[Object.keys(limbs)[index]];

        if (limb) {
          // Position at the "from" joint
          limb.position.set(fromX, fromY, fromZ);

          // Calculate direction and length
          const direction = new THREE.Vector3(
            toX - fromX,
            toY - fromY,
            toZ - fromZ
          );
          const length = direction.length();

          // Scale the limb to match the distance between joints
          limb.scale.y = length;

          // Orient the limb to point to the "to" joint
          if (length > 0) {
            // Create a quaternion that rotates from the cylinder's default orientation to the target direction
            const cylinderDirection = new THREE.Vector3(0, 1, 0);
            direction.normalize();

            limb.quaternion.setFromUnitVectors(cylinderDirection, direction);
          }

          limb.visible = true;
        }
      } else {
        // Hide the limb if either keypoint is not detected
        const limbName = `${fromName}_to_${toName}`;
        const limb = limbs[limbName] || limbs[Object.keys(limbs)[index]];
        if (limb) {
          limb.visible = false;
        }
      }
    });
  }, [poseData]);

  return (
    <div ref={containerRef} className="w-full h-[400px]">
      <canvas className="w-full h-full" id="preview-avatar" />
    </div>
  );
}
