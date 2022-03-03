import { Injectable } from '@angular/core';
import * as DrawingUtils from '@mediapipe/drawing_utils';
import { NormalizedLandmarkList, Results } from '@mediapipe/pose';
import {
  COLOR_LEFT,
  COLOR_NEUTRAL,
  COLOR_RIGHT,
  MY_LEFT_POSEINDEX,
  MY_LEFT_POSE_CONNECTIONS,
  MY_NEUTRAL_POSEINDEX,
  MY_NEUTRAL_POSE_CONNECTIONS,
  MY_RIGHT_POSEINDEX,
  MY_RIGHT_POSE_CONNECTIONS,
} from './pose-model';

@Injectable({
  providedIn: 'root',
})
export class PoseMarksService {
  constructor() {}

  drawCanvas(outputCanvas: HTMLCanvasElement, results: Results) {
    const ctx = outputCanvas!.getContext('2d');

    if (!outputCanvas || !ctx) {
      return;
    }

    ctx.save();
    ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
    ctx.drawImage(results.image, 0, 0, outputCanvas.width, outputCanvas.height);

    //console.log(MY_POSE_CONNECTIONS);

    if (results.poseLandmarks) {
      this.drawCanvasConnectors(
        ctx,
        results.poseLandmarks,
        MY_NEUTRAL_POSE_CONNECTIONS,
        PoseMarksService.getRGBAColor(COLOR_NEUTRAL, 0.6)
      );
      this.drawCanvasConnectors(
        ctx,
        results.poseLandmarks,
        MY_LEFT_POSE_CONNECTIONS,
        PoseMarksService.getRGBAColor(COLOR_LEFT, 0.6)
      );
      this.drawCanvasConnectors(
        ctx,
        results.poseLandmarks,
        MY_RIGHT_POSE_CONNECTIONS,
        PoseMarksService.getRGBAColor(COLOR_RIGHT, 0.6)
      );

      this.drawCanvasLandmarks(
        ctx,
        results.poseLandmarks,
        MY_LEFT_POSEINDEX,
        PoseMarksService.getRGBAColor(COLOR_NEUTRAL, 0.6),
        PoseMarksService.getRGBAColor(COLOR_LEFT, 0.6)
      );
      this.drawCanvasLandmarks(
        ctx,
        results.poseLandmarks,
        MY_RIGHT_POSEINDEX,
        PoseMarksService.getRGBAColor(COLOR_NEUTRAL, 0.6),
        PoseMarksService.getRGBAColor(COLOR_RIGHT, 0.6)
      );
      this.drawCanvasLandmarks(
        ctx,
        results.poseLandmarks,
        MY_NEUTRAL_POSEINDEX,
        PoseMarksService.getRGBAColor(COLOR_NEUTRAL, 0.6),
        PoseMarksService.getRGBAColor(COLOR_NEUTRAL, 0.6)
      );
    }

    if (results.segmentationMask) {
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(
        results.segmentationMask,
        0,
        0,
        outputCanvas.width,
        outputCanvas.height
      );
    }

    ctx.restore();
  }

  private drawCanvasConnectors(
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

  private drawCanvasLandmarks(
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

  static getRGBAColor(color: THREE.Color, alpha: number): string {
    return `rgba(${color.r * 255}, ${color.g * 255}, ${
      color.b * 255
    }, ${alpha})`;
  }
}
