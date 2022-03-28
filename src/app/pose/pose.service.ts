import { Injectable } from "@angular/core";
import { NormalizedLandmark, NormalizedLandmarkList, Pose, POSE_LANDMARKS_LEFT, POSE_LANDMARKS_RIGHT, Results } from "@mediapipe/pose";
import * as THREE from "three";
import { DebugService } from "../store/debug/debug.service";
import { Angles, PersonAngles } from "../store/viewer/viewer.state";
import { VideoService } from "../video/video.service";
import { PoseGridService } from "./pose-grid.service";
import { PoseMarksService } from "./pose-marks.service";
import { MID_FOOT_INDEX, MID_HIP, MID_SHOULDER } from "./pose-model";

@Injectable({
  providedIn: "root",
})
export class PoseService {
  constructor(private videoService: VideoService, private poseMarksService: PoseMarksService, private poseGridService: PoseGridService, private debugService: DebugService) {}

  initPose(callback: CallableFunction): Pose | null {
    if (this.debugService.params.calculatePoseOff) {
      console.warn("Debug is on, do not initialize pose");
      return null;
    }

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
      throw new Error("No gridCanvas exists");
    }
    this.poseGridService.initGrid(this.videoService.gridCanvas);

    return pose;
  }

  enhanceResults(results: Results) {
    if (results.poseLandmarks) {
      results.poseLandmarks[MID_SHOULDER] = this.getMidPoint(results.poseLandmarks, POSE_LANDMARKS_RIGHT.RIGHT_SHOULDER, POSE_LANDMARKS_LEFT.LEFT_SHOULDER);
      results.poseLandmarks[MID_HIP] = this.getMidPoint(results.poseLandmarks, POSE_LANDMARKS_RIGHT.RIGHT_HIP, POSE_LANDMARKS_LEFT.LEFT_HIP);
      results.poseLandmarks[MID_FOOT_INDEX] = this.getMidPoint(results.poseLandmarks, POSE_LANDMARKS_RIGHT.RIGHT_FOOT_INDEX, POSE_LANDMARKS_LEFT.LEFT_FOOT_INDEX);
    }
    if (results.poseWorldLandmarks) {
      results.poseWorldLandmarks[MID_SHOULDER] = this.getMidPoint(results.poseWorldLandmarks, POSE_LANDMARKS_RIGHT.RIGHT_SHOULDER, POSE_LANDMARKS_LEFT.LEFT_SHOULDER);
      results.poseWorldLandmarks[MID_HIP] = this.getMidPoint(results.poseWorldLandmarks, POSE_LANDMARKS_RIGHT.RIGHT_HIP, POSE_LANDMARKS_LEFT.LEFT_HIP);
      results.poseWorldLandmarks[MID_FOOT_INDEX] = this.getMidPoint(results.poseWorldLandmarks, POSE_LANDMARKS_RIGHT.RIGHT_FOOT_INDEX, POSE_LANDMARKS_LEFT.LEFT_FOOT_INDEX);
    }
  }

  private vertical = new THREE.Vector3(0, 1, 0);
  private horizontal = new THREE.Vector3(0, 0, 1); //TODO: change to reference feet normal

  calculateAngles(results: Results): { angles?: PersonAngles } {
    if (!results.poseWorldLandmarks) {
      return {};
    }

    const anglesRightForearms = this.getAngles(results.poseWorldLandmarks, POSE_LANDMARKS_LEFT.LEFT_FOOT_INDEX, POSE_LANDMARKS_RIGHT.RIGHT_FOOT_INDEX, POSE_LANDMARKS_RIGHT.RIGHT_SHOULDER, POSE_LANDMARKS_RIGHT.RIGHT_ELBOW);
    const anglesLeftForearms = this.getAngles(results.poseWorldLandmarks, POSE_LANDMARKS_LEFT.LEFT_FOOT_INDEX, POSE_LANDMARKS_RIGHT.RIGHT_FOOT_INDEX, POSE_LANDMARKS_LEFT.LEFT_SHOULDER, POSE_LANDMARKS_LEFT.LEFT_ELBOW);
    const anglesRightArms = this.getAngles(results.poseWorldLandmarks, POSE_LANDMARKS_LEFT.LEFT_FOOT_INDEX, POSE_LANDMARKS_RIGHT.RIGHT_FOOT_INDEX, POSE_LANDMARKS_RIGHT.RIGHT_SHOULDER, POSE_LANDMARKS_RIGHT.RIGHT_WRIST);
    const anglesLeftArms = this.getAngles(results.poseWorldLandmarks, POSE_LANDMARKS_LEFT.LEFT_FOOT_INDEX, POSE_LANDMARKS_RIGHT.RIGHT_FOOT_INDEX, POSE_LANDMARKS_LEFT.LEFT_SHOULDER, POSE_LANDMARKS_LEFT.LEFT_WRIST);

    return {
      angles: {
        angleHipsFeet: this.getAngles(results.poseWorldLandmarks, POSE_LANDMARKS_LEFT.LEFT_FOOT_INDEX, POSE_LANDMARKS_RIGHT.RIGHT_FOOT_INDEX, POSE_LANDMARKS_LEFT.LEFT_HIP, POSE_LANDMARKS_RIGHT.RIGHT_HIP),
        angleShouldersFeet: this.getAngles(results.poseWorldLandmarks, POSE_LANDMARKS_LEFT.LEFT_FOOT_INDEX, POSE_LANDMARKS_RIGHT.RIGHT_FOOT_INDEX, POSE_LANDMARKS_LEFT.LEFT_SHOULDER, POSE_LANDMARKS_RIGHT.RIGHT_SHOULDER),
        angleArmsFeet: anglesRightArms.tot !== NaN ? anglesRightArms : anglesLeftArms.tot !== NaN ? anglesLeftArms : anglesRightForearms.tot !== NaN ? anglesRightForearms : anglesLeftForearms,
      },
    };
  }

  drawPoses(results: Results) {
    if (!this.videoService.outputCanvas) {
      throw new Error("No outputcanvas exists");
    }

    this.poseMarksService.drawCanvas(this.videoService.outputCanvas, results);

    this.poseGridService.drawGrid(results);
  }

  getAngles(points: NormalizedLandmarkList, vector1p1: number, vector1p2: number, vector2p1: number, vector2p2: number): Angles {
    const vectors1 = this.getVectors(points, vector1p1, vector1p2);
    const vectors2 = this.getVectors(points, vector2p1, vector2p2);

    return {
      hor: this.radToDeg(this.signedAngleTo(vectors1.hor, vectors2.hor)),
      ver: this.radToDeg(this.signedAngleTo(vectors1.ver, vectors2.ver)),
      tot: this.radToDeg(this.signedAngleTo(vectors1.vec, vectors2.vec)),
    };
  }
  getVectors(points: NormalizedLandmarkList, i1: number, i2: number): { vec?: THREE.Vector3; hor?: THREE.Vector3; ver?: THREE.Vector3 } {
    const p1 = points[i1];
    const p2 = points[i2];

    if (this.getMinVisibility(p1.visibility, p2.visibility)! < 0.6) {
      return {};
    }

    const vec = new THREE.Vector3(p1.x - p2.x, p1.y - p2.y, p1.z - p2.z);
    const hor = vec.clone().projectOnPlane(this.vertical);
    const ver = vec.clone().projectOnPlane(this.horizontal);
    return {
      vec: vec,
      hor: hor,
      ver: ver,
    };
  }
  getMidPoint(points: NormalizedLandmarkList, i1: number, i2: number): NormalizedLandmark {
    return {
      x: (points[i1].x + points[i2].x) / 2,
      y: (points[i1].y + points[i2].y) / 2,
      z: (points[i1].z + points[i2].z) / 2,
      visibility: this.getMinVisibility(points[i1].visibility, points[i2].visibility),
    };
  }
  getMinVisibility(vis1?: number, vis2?: number): number | undefined {
    if (!vis1 || !vis2) {
      return undefined;
    } else {
      return Math.min(vis1, vis2);
    }
  }
  radToDeg(rad: number): number {
    return (180.0 * rad) / Math.PI;
  }
  getNormal(u: THREE.Vector3, v: THREE.Vector3): THREE.Vector3 {
    return new THREE.Plane().setFromCoplanarPoints(new THREE.Vector3(), u, v).normal;
  }
  signedAngleTo(u: THREE.Vector3 | undefined, v: THREE.Vector3 | undefined): number {
    if (!u || !v) {
      return NaN;
    }
    // Get the signed angle between u and v, in the range [-pi, pi]
    const angle = u.angleTo(v);
    const normal = this.getNormal(u, v);
    return (normal.z == 0 ? normal.y / Math.abs(normal.y) : normal.z / Math.abs(normal.z)) * angle;
  }
}
