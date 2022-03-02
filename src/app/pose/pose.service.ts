import { Injectable } from '@angular/core';
import {
  NormalizedLandmark,
  NormalizedLandmarkList,
  Pose,
  POSE_LANDMARKS_LEFT,
  POSE_LANDMARKS_RIGHT,
  Results,
} from '@mediapipe/pose';
import { VideoService } from '../video/video.service';
import { PoseGridService } from './pose-grid.service';
import { PoseMarksService } from './pose-marks.service';
import { MID_FOOT_INDEX, MID_HIP, MID_SHOULDER } from './pose-model';

@Injectable({
  providedIn: 'root',
})
export class PoseService {
  constructor(
    private videoService: VideoService,
    private poseMarksService: PoseMarksService,
    private poseGridService: PoseGridService
  ) {}

  initPose(callback: CallableFunction): Pose {
    const pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      },
    });
    pose.setOptions({
      selfieMode: false,
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    pose.onResults((results: Results) => {
      callback(results);
    });

    if (!this.videoService.gridCanvas) {
      throw new Error('No gridCanvas exists');
    }
    this.poseGridService.initGrid(this.videoService.gridCanvas);

    return pose;
  }

  enhanceResults(results: Results) {
    if (results.poseLandmarks) {
      results.poseLandmarks[MID_SHOULDER] = this.getMidPoint(
        results.poseLandmarks,
        POSE_LANDMARKS_RIGHT.RIGHT_SHOULDER,
        POSE_LANDMARKS_LEFT.LEFT_SHOULDER
      );
      results.poseLandmarks[MID_HIP] = this.getMidPoint(
        results.poseLandmarks,
        POSE_LANDMARKS_RIGHT.RIGHT_HIP,
        POSE_LANDMARKS_LEFT.LEFT_HIP
      );
      results.poseLandmarks[MID_FOOT_INDEX] = this.getMidPoint(
        results.poseLandmarks,
        POSE_LANDMARKS_RIGHT.RIGHT_FOOT_INDEX,
        POSE_LANDMARKS_LEFT.LEFT_FOOT_INDEX
      );
    }
    if (results.poseWorldLandmarks) {
      results.poseWorldLandmarks[MID_SHOULDER] = this.getMidPoint(
        results.poseWorldLandmarks,
        POSE_LANDMARKS_RIGHT.RIGHT_SHOULDER,
        POSE_LANDMARKS_LEFT.LEFT_SHOULDER
      );
      results.poseWorldLandmarks[MID_HIP] = this.getMidPoint(
        results.poseWorldLandmarks,
        POSE_LANDMARKS_RIGHT.RIGHT_HIP,
        POSE_LANDMARKS_LEFT.LEFT_HIP
      );
      results.poseWorldLandmarks[MID_FOOT_INDEX] = this.getMidPoint(
        results.poseWorldLandmarks,
        POSE_LANDMARKS_RIGHT.RIGHT_FOOT_INDEX,
        POSE_LANDMARKS_LEFT.LEFT_FOOT_INDEX
      );
    }
  }

  drawPoses(results: Results) {
    if (!this.videoService.outputCanvas) {
      throw new Error('No outputcanvas exists');
    }

    this.poseMarksService.drawCanvas(this.videoService.outputCanvas, results);

    this.poseGridService.drawGrid(results);
  }

  getMidPoint(
    points: NormalizedLandmarkList,
    i1: number,
    i2: number
  ): NormalizedLandmark {
    return {
      x: (points[i1].x + points[i2].x) / 2,
      y: (points[i1].y + points[i2].y) / 2,
      z: (points[i1].z + points[i2].z) / 2,
      visibility: this.getMinVisibility(
        points[i1].visibility,
        points[i2].visibility
      ),
    };
  }
  getMinVisibility(vis1?: number, vis2?: number): number | undefined {
    if (!vis1 || !vis2) {
      return undefined;
    } else {
      return Math.min(vis1, vis2);
    }
  }
}
