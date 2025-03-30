import { createPoseLandmarker } from "@/utils/mediapipe";
import { useEffect, useState } from "react";

export const useMediaPipe = () => {
      const [poseLandmarker, setPoseLandmarker] = useState<any>(null);

    useEffect(() => {
        createPoseLandmarker().then(setPoseLandmarker)
            .catch((error) => {
            console.error("Error loading pose landmarker:", error);
        }
    );
    }, []);    

    return poseLandmarker;
}
