import { Injectable } from '@angular/core';
import * as DrawingUtils from '@mediapipe/drawing_utils';
import {
  NormalizedLandmark,
  NormalizedLandmarkList,
  Pose,
  POSE_LANDMARKS,
  POSE_LANDMARKS_LEFT,
  POSE_LANDMARKS_RIGHT,
  Results,
} from '@mediapipe/pose';
import * as THREE from 'three';
import { VideoService } from './video.service';

export const MAX_POSE_INDEX = 32;
export const MID_SHOULDER = MAX_POSE_INDEX + 1;
export const MID_HIP = MAX_POSE_INDEX + 2;
export const MID_FOOT_INDEX = MAX_POSE_INDEX + 3;

export const MY_LEFT_POSEINDEX = [
  POSE_LANDMARKS_LEFT.LEFT_SHOULDER,
  POSE_LANDMARKS_LEFT.LEFT_HIP,
  POSE_LANDMARKS_LEFT.LEFT_HEEL,
  POSE_LANDMARKS_LEFT.LEFT_FOOT_INDEX,
];
export const MY_RIGHT_POSEINDEX = [
  POSE_LANDMARKS_RIGHT.RIGHT_SHOULDER,
  POSE_LANDMARKS_RIGHT.RIGHT_HIP,
  POSE_LANDMARKS_RIGHT.RIGHT_HEEL,
  POSE_LANDMARKS_RIGHT.RIGHT_FOOT_INDEX,
];
export const MY_NEUTRAL_POSEINDEX = [MID_HIP, MID_SHOULDER, MID_FOOT_INDEX];

export const MY_ALL_POSEINDEX = MY_LEFT_POSEINDEX.concat(
  MY_RIGHT_POSEINDEX,
  MY_NEUTRAL_POSEINDEX
);

export const MY_NEUTRAL_POSE_CONNECTIONS: Array<[number, number]> = [
  // [POSE_LANDMARKS.LEFT_EYE, POSE_LANDMARKS.RIGHT_EYE],
  [POSE_LANDMARKS_LEFT.LEFT_SHOULDER, POSE_LANDMARKS_RIGHT.RIGHT_SHOULDER],
  [POSE_LANDMARKS_LEFT.LEFT_HIP, POSE_LANDMARKS_RIGHT.RIGHT_HIP],
  [POSE_LANDMARKS_LEFT.LEFT_FOOT_INDEX, POSE_LANDMARKS_RIGHT.RIGHT_FOOT_INDEX],
];
export const MY_LEFT_POSE_CONNECTIONS: Array<[number, number]> = [
  [POSE_LANDMARKS_LEFT.LEFT_EYE, POSE_LANDMARKS.NOSE],
  [POSE_LANDMARKS_LEFT.LEFT_SHOULDER, POSE_LANDMARKS_LEFT.LEFT_ELBOW],
  [POSE_LANDMARKS_LEFT.LEFT_ELBOW, POSE_LANDMARKS_LEFT.LEFT_WRIST],
  [POSE_LANDMARKS_LEFT.LEFT_SHOULDER, POSE_LANDMARKS_LEFT.LEFT_HIP],
  [POSE_LANDMARKS_LEFT.LEFT_HIP, POSE_LANDMARKS_LEFT.LEFT_KNEE],
  [POSE_LANDMARKS_LEFT.LEFT_KNEE, POSE_LANDMARKS_LEFT.LEFT_ANKLE],
  [POSE_LANDMARKS_LEFT.LEFT_ANKLE, POSE_LANDMARKS_LEFT.LEFT_HEEL],
  [POSE_LANDMARKS_LEFT.LEFT_HEEL, POSE_LANDMARKS_LEFT.LEFT_FOOT_INDEX],
];
export const MY_RIGHT_POSE_CONNECTIONS: Array<[number, number]> = [
  [POSE_LANDMARKS_RIGHT.RIGHT_EYE, POSE_LANDMARKS.NOSE],
  [POSE_LANDMARKS_RIGHT.RIGHT_SHOULDER, POSE_LANDMARKS_RIGHT.RIGHT_ELBOW],
  [POSE_LANDMARKS_RIGHT.RIGHT_ELBOW, POSE_LANDMARKS_RIGHT.RIGHT_WRIST],
  [POSE_LANDMARKS_RIGHT.RIGHT_SHOULDER, POSE_LANDMARKS_RIGHT.RIGHT_HIP],
  [POSE_LANDMARKS_RIGHT.RIGHT_HIP, POSE_LANDMARKS_RIGHT.RIGHT_KNEE],
  [POSE_LANDMARKS_RIGHT.RIGHT_KNEE, POSE_LANDMARKS_RIGHT.RIGHT_ANKLE],
  [POSE_LANDMARKS_RIGHT.RIGHT_ANKLE, POSE_LANDMARKS_RIGHT.RIGHT_HEEL],
  [POSE_LANDMARKS_RIGHT.RIGHT_HEEL, POSE_LANDMARKS_RIGHT.RIGHT_FOOT_INDEX],
];
export const MY_ALL_POSE_CONNECTIONS = MY_LEFT_POSE_CONNECTIONS.concat(
  MY_RIGHT_POSE_CONNECTIONS,
  MY_NEUTRAL_POSE_CONNECTIONS
);

export const COLOR_LEFT = new THREE.Color(0xffa500);
export const COLOR_RIGHT = new THREE.Color(0x00d9e7);
export const COLOR_NEUTRAL = new THREE.Color(0xffffff);

@Injectable({
  providedIn: 'root',
})
export class PoseService {
  camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  light = new THREE.PointLight(0xffffff, 1);

  renderer = new THREE.WebGL1Renderer();
  geometry = new THREE.BoxGeometry();
  material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  scene = new THREE.Scene();

  constructor(private videoService: VideoService) {}

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

    this.camera.position.z = 2;

    // console.log(this.videoService.gridCanvas!.width);
    // console.log(this.videoService.gridCanvas!.clientWidth);

    this.renderer.setSize(
      this.videoService.gridCanvas!.clientWidth,
      this.videoService.gridCanvas!.clientHeight
    );
    this.videoService.gridCanvas!.appendChild(this.renderer.domElement);

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
      this.drawCanvasConnectors(
        ctx,
        results.poseLandmarks,
        MY_NEUTRAL_POSE_CONNECTIONS,
        PoseService.getRGBAColor(COLOR_NEUTRAL, 0.6)
      );
      this.drawCanvasConnectors(
        ctx,
        results.poseLandmarks,
        MY_LEFT_POSE_CONNECTIONS,
        PoseService.getRGBAColor(COLOR_LEFT, 0.6)
      );
      this.drawCanvasConnectors(
        ctx,
        results.poseLandmarks,
        MY_RIGHT_POSE_CONNECTIONS,
        PoseService.getRGBAColor(COLOR_RIGHT, 0.6)
      );

      this.drawCanvasLandmarks(
        ctx,
        results.poseLandmarks,
        MY_LEFT_POSEINDEX,
        PoseService.getRGBAColor(COLOR_NEUTRAL, 0.6),
        PoseService.getRGBAColor(COLOR_LEFT, 0.6)
      );
      this.drawCanvasLandmarks(
        ctx,
        results.poseLandmarks,
        MY_RIGHT_POSEINDEX,
        PoseService.getRGBAColor(COLOR_NEUTRAL, 0.6),
        PoseService.getRGBAColor(COLOR_RIGHT, 0.6)
      );
      this.drawCanvasLandmarks(
        ctx,
        results.poseLandmarks,
        MY_NEUTRAL_POSEINDEX,
        PoseService.getRGBAColor(COLOR_NEUTRAL, 0.6),
        PoseService.getRGBAColor(COLOR_NEUTRAL, 0.6)
      );
    }

    if (results.segmentationMask) {
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(results.segmentationMask, 0, 0, c.width, c.height);
    }

    ctx.restore();
  }

  //leftPoints: Float32Array[] = [];
  // leftConnectorsPoints: Float32Array[] = [];
  // rightConnectorsPoints: Float32Array[] = [];
  // neutralConnectorsPoints: Float32Array[] = [];
  lines: THREE.Line[] = [];
  spheres: THREE.Mesh[] = [];

  drawGrid(results: Results) {
    if (results.poseWorldLandmarks) {
      // First create the the connectors and points
      if (this.scene.children.length === 0) {
        this.addGridPoints(
          this.calculateGridPoints(MY_LEFT_POSEINDEX, results),
          COLOR_LEFT
        );
        this.addGridPoints(
          this.calculateGridPoints(MY_RIGHT_POSEINDEX, results),
          COLOR_RIGHT
        );
        this.addGridPoints(
          this.calculateGridPoints(MY_NEUTRAL_POSEINDEX, results),
          COLOR_NEUTRAL
        );

        this.addGridConnectorsLines(
          this.calculateGridConnectorsPoints(MY_LEFT_POSE_CONNECTIONS, results),
          COLOR_LEFT
        );
        this.addGridConnectorsLines(
          this.calculateGridConnectorsPoints(MY_RIGHT_POSE_CONNECTIONS, results),
          COLOR_RIGHT
        );
        this.addGridConnectorsLines(
          this.calculateGridConnectorsPoints(MY_NEUTRAL_POSE_CONNECTIONS, results),
          COLOR_NEUTRAL
        );

        this.lines.forEach((l) => {
          this.scene.add(l);
        });
        this.spheres.forEach((l) => {
          this.scene.add(l);
        });




      }

      // on each result update the connectors and points
      this.updateGridPoints(this.spheres, MY_ALL_POSEINDEX, results);
      this.updateGridConnectorsPoints(
        this.lines,
        MY_ALL_POSE_CONNECTIONS,
        results
      );

      this.hideGridStuff(results);

      this.lines.forEach((l) => {
        l.geometry.attributes['position'].needsUpdate = true;
      });
      this.spheres.forEach((l) => {
        l.geometry.attributes['position'].needsUpdate = true;
      });

      // calculate the camera
      // const leftFoot =
      //   results.poseWorldLandmarks[POSE_LANDMARKS_LEFT.LEFT_FOOT_INDEX];
      //   const rightFoot =
      //   results.poseWorldLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_FOOT_INDEX];
      //   const middleFoot =
      //   results.poseWorldLandmarks[MID_FOOT_INDEX];
      // if (
      //   leftFoot.visibility &&
      //   leftFoot.visibility > 0.7 &&
      //   rightFoot.visibility &&
      //   rightFoot.visibility > 0.7
      // ) {
      //   const feetVector = new THREE.Vector3(
      //     leftFoot.x - rightFoot.x,
      //     leftFoot.y - rightFoot.y,
      //     leftFoot.z - rightFoot.z
      //   );
      //   const normalVector = feetVector
      //     .cross(new THREE.Vector3(0, 1, 0))
      //     .normalize();
      //   console.log(this.camera.position);

      //   const middle = new THREE.Vector3(middleFoot.x, -middleFoot.y, -middleFoot.z)
      //   const camPos = middle.addScaledVector(normalVector, 2);
      //   this.camera.position.set(camPos.x, camPos.y, camPos.z);
      //   this.camera.up.set(0, 1, 0);
      //   //this.camera.lookAt(middle.x, middle.y, middle.z);
      //   this.camera.lookAt(0, 0, 0);
      // }

      this.light.position.copy(this.camera.position);
      this.renderer.render(this.scene, this.camera);
    } else {
      this.hideGridConnectorsAllLines();
    }
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

  private calculateGridPoints(
    poseConnection: number[],
    results: Results
  ): Float32Array[] {
    return poseConnection
      .map((i) => results.poseWorldLandmarks[i])
      .map((p) => {
        return Float32Array.from([p.x, -p.y, -p.z]);
      });
  }
  private calculateGridConnectorsPoints(
    poseConnection: [number, number][],
    results: Results
  ): Float32Array[] {
    return poseConnection
      .map((ps) => {
        return [
          results.poseWorldLandmarks[ps[0]],
          results.poseWorldLandmarks[ps[1]],
        ];
      })
      .map((lms) => {
        return Float32Array.from(lms.flatMap((p) => [p.x, -p.y, -p.z]));
      });
  }

  private updateGridPoints(
    spheres: THREE.Mesh[],
    poseConnection: number[],
    results: Results
  ) {
    poseConnection
      .map((i) => results.poseWorldLandmarks[i])
      .forEach((l, index1) => {
        spheres[index1].position.set(l.x, -l.y, -l.z);
      });
  }

  private updateGridConnectorsPoints(
    lines: THREE.Line[],
    poseConnection: [number, number][],
    results: Results
  ) {
    poseConnection
      .map((ps) => {
        return [
          results.poseWorldLandmarks[ps[0]],
          results.poseWorldLandmarks[ps[1]],
        ];
      })
      .forEach((lms, index1) => {
        lines[index1].geometry.setAttribute(
          'position',
          new THREE.BufferAttribute(
            Float32Array.from([
              lms[0].x,
              -lms[0].y,
              -lms[0].z,
              lms[1].x,
              -lms[1].y,
              -lms[1].z,
            ]),
            3
          )
        );
        // lms.forEach((l, index2) => {
        //   points[index1][index2 * 3 + 0] = l.x;
        //   points[index1][index2 * 3 + 1] = -l.y;
        //   points[index1][index2 * 3 + 2] = -l.z;
        // });
      });
  }

  private addGridPoints(points: Float32Array[], color: THREE.Color) {
    points.forEach((point) => {
      const geometry1 = new THREE.SphereGeometry(0.03, 32, 16);
      const material1 = new THREE.MeshBasicMaterial({ color: color });
      const sphere1 = new THREE.Mesh(geometry1, material1);
      sphere1.position.set(point[0], point[1], point[2]);
      this.spheres.push(sphere1);
    });
  }

  private addGridConnectorsLines(points: Float32Array[], color: THREE.Color) {
    points.forEach((linePoints) => {
      const geometry1 = new THREE.BufferGeometry().setAttribute(
        'position',
        new THREE.BufferAttribute(linePoints, 3)
      );
      const material1 = new THREE.LineBasicMaterial({ color: color });
      const lines1 = new THREE.Line(geometry1, material1);
      this.lines.push(lines1);
    });
  }

  private hideGridStuff(results: Results) {
    MY_ALL_POSEINDEX.map((pointIndex) => {
      const vis = results.poseWorldLandmarks[pointIndex].visibility;

      return !!vis && vis > 0.5;
    }).forEach((b, index) => {
      this.spheres[index].visible = b;
    });
    MY_ALL_POSE_CONNECTIONS.map((lineIndexes) => {
      return lineIndexes.every((pointIndex) => {
        const vis = results.poseWorldLandmarks[pointIndex].visibility;

        return !!vis && vis > 0.5;
      });
    }).forEach((b, index) => {
      this.lines[index].visible = b;
    });
  }
  private hideGridConnectorsAllLines() {
    this.lines.forEach((l) => {
      l.visible = false;
    });
  }

  static getRGBColor(color: THREE.Color): string {
    return color.getStyle();
  }
  static getRGBAColor(color: THREE.Color, alpha: number): string {
    return `rgba(${color.r * 255}, ${color.g * 255}, ${
      color.b * 255
    }, ${alpha})`;
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
