"use client";
import { landmarkAtom } from "@/atoms/landmarkAtom";
import { poseLandmarkNames } from "@/const/landmarks";
import { useMediaPipe } from "@/hooks/meidapipe";
import { LandMarks } from "@/types";
import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";

export default function PoseLandmarkerDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [webcamRunning, setWebcamRunning] = useState<boolean>(false);
  const videoWidth = 480;
  const videoHeight = 360;
  const lastVideoTimeRef = useRef(-1);
  const runningModeRef = useRef<"IMAGE" | "VIDEO">("IMAGE");
  const webcamRunningRef = useRef(false);
  const [landmarkData, setLandmarkData] = useAtom(landmarkAtom);

  const poseLandmarker = useMediaPipe();

  const toggleWebcam = async () => {
    if (!poseLandmarker || !canvasRef.current) return;

    setWebcamRunning((prev) => !prev);

    // Clear the canvas
    const ctx = canvasRef.current?.getContext("2d");
    ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

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
      if (!webcamRunningRef.current) return;

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
            canvasCtx.restore();

            const newLandmarkData: LandMarks = { ...landmarkData };
            if (result.landmarks.length === 0) {
              return;
            }
            // NOTE: Only one person
            for (const [id, landmark] of result.landmarks[0]?.entries()) {
              newLandmarkData[poseLandmarkNames[id]] = {
                x: landmark.x,
                y: landmark.y,
                z: landmark.z,
                visibility: landmark.visibility,
              };
            }
            setLandmarkData(newLandmarkData);
          }
        );
      }

      requestAnimationFrame(loop);
    };

    loop();
  };

  return (
    <div>
      <button
        className="rounded-md p-2 text-white bg-blue-500 hover:bg-blue-600 transition duration-200"
        onClick={toggleWebcam}
      >
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
