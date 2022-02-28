import { Injectable } from '@angular/core';
import { NormalizedLandmarkList } from '@mediapipe/drawing_utils';
import {
  POSE_LANDMARKS_LEFT,
  POSE_LANDMARKS_RIGHT,
  POSE_LANDMARKS,
  Results,
} from '@mediapipe/pose';
import * as DrawingUtils from '@mediapipe/drawing_utils';
import { VideoService } from './video.service';

export const MY_LEFT_POSEINDEX = [
  // POSE_LANDMARKS_LEFT.LEFT_EYE,
  POSE_LANDMARKS_LEFT.LEFT_SHOULDER,
  // POSE_LANDMARKS_LEFT.LEFT_ELBOW,
  // POSE_LANDMARKS_LEFT.LEFT_WRIST,
  POSE_LANDMARKS_LEFT.LEFT_HIP,
  POSE_LANDMARKS_LEFT.LEFT_HEEL,
  POSE_LANDMARKS_LEFT.LEFT_FOOT_INDEX,
];
export const MY_RIGHT_POSEINDEX = [
  // POSE_LANDMARKS_RIGHT.RIGHT_EYE,
  POSE_LANDMARKS_RIGHT.RIGHT_SHOULDER,
  // POSE_LANDMARKS_RIGHT.RIGHT_ELBOW,
  // POSE_LANDMARKS_RIGHT.RIGHT_WRIST,
  POSE_LANDMARKS_RIGHT.RIGHT_HIP,
  POSE_LANDMARKS_RIGHT.RIGHT_HEEL,
  POSE_LANDMARKS_RIGHT.RIGHT_FOOT_INDEX,
];
export const MY_NEUTRAL_POSEINDEX = [];

export const MY_POSE_CONNECTIONS: Array<[number, number]> = [
  // [POSE_LANDMARKS.LEFT_EYE, POSE_LANDMARKS.RIGHT_EYE],
  [POSE_LANDMARKS_LEFT.LEFT_SHOULDER, POSE_LANDMARKS_RIGHT.RIGHT_SHOULDER],
  [POSE_LANDMARKS_LEFT.LEFT_HIP, POSE_LANDMARKS_RIGHT.RIGHT_HIP],
  [POSE_LANDMARKS_LEFT.LEFT_FOOT_INDEX, POSE_LANDMARKS_RIGHT.RIGHT_FOOT_INDEX],
];
export const MY_POSE_CONNECTIONS_PERSON_LEFT: Array<[number, number]> = [
  [POSE_LANDMARKS_LEFT.LEFT_EYE, POSE_LANDMARKS.NOSE],
  [POSE_LANDMARKS_LEFT.LEFT_SHOULDER, POSE_LANDMARKS_LEFT.LEFT_ELBOW],
  [POSE_LANDMARKS_LEFT.LEFT_ELBOW, POSE_LANDMARKS_LEFT.LEFT_WRIST],
  [POSE_LANDMARKS_LEFT.LEFT_SHOULDER, POSE_LANDMARKS_LEFT.LEFT_HIP],
  [POSE_LANDMARKS_LEFT.LEFT_HIP, POSE_LANDMARKS_LEFT.LEFT_KNEE],
  [POSE_LANDMARKS_LEFT.LEFT_KNEE, POSE_LANDMARKS_LEFT.LEFT_ANKLE],
  [POSE_LANDMARKS_LEFT.LEFT_ANKLE, POSE_LANDMARKS_LEFT.LEFT_HEEL],
  [POSE_LANDMARKS_LEFT.LEFT_HEEL, POSE_LANDMARKS_LEFT.LEFT_FOOT_INDEX],
];
export const MY_POSE_CONNECTIONS_PERSON_RIGHT: Array<[number, number]> = [
  [POSE_LANDMARKS_RIGHT.RIGHT_EYE, POSE_LANDMARKS.NOSE],
  [POSE_LANDMARKS_RIGHT.RIGHT_SHOULDER, POSE_LANDMARKS_RIGHT.RIGHT_ELBOW],
  [POSE_LANDMARKS_RIGHT.RIGHT_ELBOW, POSE_LANDMARKS_RIGHT.RIGHT_WRIST],
  [POSE_LANDMARKS_RIGHT.RIGHT_SHOULDER, POSE_LANDMARKS_RIGHT.RIGHT_HIP],
  [POSE_LANDMARKS_RIGHT.RIGHT_HIP, POSE_LANDMARKS_RIGHT.RIGHT_KNEE],
  [POSE_LANDMARKS_RIGHT.RIGHT_KNEE, POSE_LANDMARKS_RIGHT.RIGHT_ANKLE],
  [POSE_LANDMARKS_RIGHT.RIGHT_ANKLE, POSE_LANDMARKS_RIGHT.RIGHT_HEEL],
  [POSE_LANDMARKS_RIGHT.RIGHT_HEEL, POSE_LANDMARKS_RIGHT.RIGHT_FOOT_INDEX],
];

export const COLOR_LEFT = 'rgba(255,138,0,0.6)';
export const COLOR_RIGHT = 'rgba(0,217,231,0.6)';
export const COLOR_NEUTRAL = 'rgba(255,255,255,0.6)';

@Injectable({
  providedIn: 'root',
})
export class PoseService {
  constructor(private videoService: VideoService) {}



  drawCanvas(results: Results) {
    const c = this.videoService.outputCanvas;
    const ctx = c!.getContext('2d');

    if (!c || !ctx) {
      return;
    }

    ctx.save();
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(results.image, 0, 0, c.width, c.height);

    //console.log(MY_POSE_CONNECTIONS);

    if (results.poseLandmarks) {
      this.drawConnectors(ctx, results.poseLandmarks, MY_POSE_CONNECTIONS, COLOR_NEUTRAL);
      this.drawConnectors(ctx, results.poseLandmarks, MY_POSE_CONNECTIONS_PERSON_LEFT, COLOR_LEFT);
      this.drawConnectors(ctx, results.poseLandmarks, MY_POSE_CONNECTIONS_PERSON_RIGHT, COLOR_RIGHT);

      this.drawLandmarks(ctx, results.poseLandmarks, MY_LEFT_POSEINDEX, COLOR_NEUTRAL, COLOR_LEFT);
      this.drawLandmarks(ctx, results.poseLandmarks, MY_RIGHT_POSEINDEX, COLOR_NEUTRAL, COLOR_RIGHT);
      this.drawLandmarks(ctx, results.poseLandmarks, MY_NEUTRAL_POSEINDEX, COLOR_NEUTRAL, COLOR_NEUTRAL);

    }

    if (results.segmentationMask) {
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(results.segmentationMask, 0, 0, c.width, c.height);
    }

    // console.log(results);

    ctx.restore();
  }

  private drawConnectors(
    ctx: CanvasRenderingContext2D,
    landmarks: NormalizedLandmarkList,
    connectors: [number, number][],
    color: string
  ) {
    DrawingUtils.drawConnectors(ctx, landmarks, connectors, {
      visibilityMin: 0.65,
      color: color,
      lineWidth: 2,
    });
  }

  private drawLandmarks(
    ctx: CanvasRenderingContext2D,
    landmarks: NormalizedLandmarkList,
    indexs: number[],
    color_border: string,
    color_circle: string
  ) {
    DrawingUtils.drawLandmarks(
      ctx,
      Object.values(indexs).map((index) => landmarks[index]),
      {
        visibilityMin: 0.65,
        color: color_border,
        fillColor: color_circle,
        lineWidth: 2,
      }
    );
  }
}
