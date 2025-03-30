"use client";
import { landmarkAtom } from "@/atoms/landmarkAtom";
import { poseLandmarkNames } from "@/const/landmarks";
import { LandMark } from "@/types";
import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";

export default function PoseLandmarkerDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [poseLandmarker, setPoseLandmarker] = useState<any>(null);
  const [webcamRunning, setWebcamRunning] = useState<boolean>(false);
  const videoWidth = 480;
  const videoHeight = 360;
  const lastVideoTimeRef = useRef(-1);
  const runningModeRef = useRef<"IMAGE" | "VIDEO">("IMAGE");
  const webcamRunningRef = useRef(false);
  const [landmarkData, setLandmarkData] = useAtom(landmarkAtom);

  useEffect(() => {
    const createPoseLandmarker = async () => {
      const vision = await (
        await import("@mediapipe/tasks-vision")
      ).FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );
      const { PoseLandmarker } = await import("@mediapipe/tasks-vision");

      const landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "GPU",
        },
        runningMode: "IMAGE",
        numPoses: 2,
      });
      setPoseLandmarker(landmarker);
    };

    createPoseLandmarker();
  }, []);

  const enableWebcam = async () => {
    if (!poseLandmarker) return;

    setWebcamRunning((prev) => !prev);

    if (!webcamRunningRef.current) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener("loadeddata", predictWebcam);
      }
    } else {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.removeEventListener("loadeddata", predictWebcam);
      }
    }
  };

  useEffect(() => {
    webcamRunningRef.current = webcamRunning;
  }, [webcamRunning]);

  const predictWebcam = async () => {
    if (!videoRef.current || !canvasRef.current || !poseLandmarker) return;

    const { DrawingUtils } = await import("@mediapipe/tasks-vision");
    const canvasCtx = canvasRef.current.getContext("2d")!;
    const drawingUtils = new DrawingUtils(canvasCtx);

    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;
    videoRef.current.width = videoWidth;
    videoRef.current.height = videoHeight;

    if (runningModeRef.current === "IMAGE") {
      runningModeRef.current = "VIDEO";
      await poseLandmarker.setOptions({ runningMode: "VIDEO" });
    }

    const loop = async () => {
      if (!webcamRunningRef) return;

      if (videoRef.current!.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = videoRef.current!.currentTime;
        const now = performance.now();

        poseLandmarker.detectForVideo(
          videoRef.current!,
          now,
          (result: { landmarks: any }) => {
            canvasCtx.save();
            canvasCtx.clearRect(
              0,
              0,
              canvasRef.current!.width,
              canvasRef.current!.height
            );
            // console.log(result.landmarks.entries());
            for (const landmark of result.landmarks) {
              drawingUtils.drawLandmarks(landmark, {
                radius: (data) =>
                  DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1),
              });
              drawingUtils.drawConnectors(
                landmark,
                poseLandmarker.POSE_CONNECTIONS
              );
            }
            // Set the landmark data to the atom
            const landmarkData: LandMark[] = [];
            if (result.landmarks.length === 0) {
              return;
            }
            for (const [id, landmark] of result.landmarks[0]?.entries()) {
              // console.log(id, landmark);
              landmarkData.push({
                x: landmark.x,
                y: landmark.y,
                z: landmark.z,
                visibility: landmark.visibility,
                name: poseLandmarkNames[id].name,
              });
            }
            setLandmarkData(landmarkData);
            // Draw the landmarks on the canvas
            canvasCtx.restore();
          }
        );
      }

      requestAnimationFrame(loop);
    };

    loop();
  };

  return (
    <div>
      <button onClick={enableWebcam}>
        {webcamRunning ? "DISABLE PREDICTIONS" : "ENABLE PREDICTIONS"}
      </button>
      <div style={{ position: "relative" }}>
        <video
          ref={videoRef}
          style={{ width: videoWidth, height: videoHeight }}
          autoPlay
          muted
        />
        <canvas
          ref={canvasRef}
          style={{ position: "absolute", top: 0, left: 0 }}
        />
      </div>
    </div>
  );
}
