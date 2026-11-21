import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';
import simdLoader from '@mediapipe/tasks-vision/vision_wasm_internal.js?url';
import simdBinary from '@mediapipe/tasks-vision/vision_wasm_internal.wasm?url';
import scalarLoader from '@mediapipe/tasks-vision/vision_wasm_nosimd_internal.js?url';
import scalarBinary from '@mediapipe/tasks-vision/vision_wasm_nosimd_internal.wasm?url';

export async function createDetector() {
  const simd = await FilesetResolver.isSimdSupported();
  return FaceDetector.createFromOptions({
    wasmLoaderPath: simd ? simdLoader : scalarLoader,
    wasmBinaryPath: simd ? simdBinary : scalarBinary,
  }, {
    baseOptions: { modelAssetPath: import.meta.env.BASE_URL + 'blaze_face_short_range.tflite', delegate: 'CPU' },
    runningMode: 'VIDEO',
    minDetectionConfidence: 0.6,
  });
}

export function readFace(detector, video, time) {
  const { detections } = detector.detectForVideo(video, time);
  const detection = detections.reduce((largest, item) => {
    return (item.boundingBox?.width ?? 0) > (largest?.boundingBox?.width ?? 0) ? item : largest;
  }, null);
  if (!detection) return null;

  const box = detection.boundingBox;
  const [firstEye, secondEye] = detection.keypoints;
  const x = firstEye && secondEye ? (firstEye.x + secondEye.x) / 2 : (box.originX + box.width / 2) / video.videoWidth;
  const y = firstEye && secondEye ? (firstEye.y + secondEye.y) / 2 : (box.originY + box.height * 0.38) / video.videoHeight;
  return { x, y, size: box.width / video.videoWidth };
}
