"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import AvatarRenderer from "@/components/avatar-renderer";

// Import the PoseDetector component dynamically to avoid SSR issues
const PoseDetector = dynamic(() => import("@/components/pose-detector"), {
  ssr: false,
});

export default function Home() {
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Check if the browser supports the required APIs
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsSupported(false);
    }
  }, []);

  if (!isSupported) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Browser Not Supported
          </h1>
          <p className="text-gray-700">
            Your browser doesn't support the camera features needed for this
            application. Please try using a modern browser like Chrome, Firefox,
            or Edge.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100">
      <h1 className="text-3xl font-bold mb-8 text-center">
        MediaPipe Pose Avatar Controller
      </h1>
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Camera Feed
          </h2>
          <PoseDetector />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold mb-4">3D Avatar</h2>
          <div
            className="relative w-full h-[400px]"
            id="avatar-container"
          ></div>
          <div className="mt-4 text-sm text-gray-600">
            <AvatarRenderer />
          </div>
        </div>
      </div>
    </main>
  );
}
