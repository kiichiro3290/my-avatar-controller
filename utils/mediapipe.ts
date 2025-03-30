export const createPoseLandmarker = async () => {
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
    })

    return landmarker;   
}
