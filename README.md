## Getting Started

```shell
pnpm install
pnpm dev
```


## 姿勢ランドマーク検出

参考(MediaPipe)

https://developers.google.com/mediapipe/solutions/vision/pose_landmarker/web_js

検出ポイント
https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker/index?hl=ja#pose_landmarker_model

各検出点のChatGPTによる命名
```
const poseLandmarks = [
  { name: "nose" },
  { name: "left_eye_inner" },
  { name: "left_eye" },
  { name: "left_eye_outer" },
  { name: "right_eye_inner" },
  { name: "right_eye" },
  { name: "right_eye_outer" },
  { name: "left_ear" },
  { name: "right_ear" },
  { name: "mouth_left" },
  { name: "mouth_right" },
  { name: "left_shoulder" },
  { name: "right_shoulder" },
  { name: "left_elbow" },
  { name: "right_elbow" },
  { name: "left_wrist" },
  { name: "right_wrist" },
  { name: "left_pinky" },
  { name: "right_pinky" },
  { name: "left_index" },
  { name: "right_index" },
  { name: "left_thumb" },
  { name: "right_thumb" },
  { name: "left_hip" },
  { name: "right_hip" },
  { name: "left_knee" },
  { name: "right_knee" },
  { name: "left_ankle" },
  { name: "right_ankle" },
  { name: "left_heel" },
  { name: "right_heel" },
  { name: "left_foot_index" },
  { name: "right_foot_index" }
];
```