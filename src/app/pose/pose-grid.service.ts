import { Injectable } from '@angular/core';
import { Results } from '@mediapipe/pose';
import * as THREE from 'three';
import {
  MY_LEFT_POSEINDEX,
  COLOR_LEFT,
  MY_RIGHT_POSEINDEX,
  COLOR_RIGHT,
  MY_NEUTRAL_POSEINDEX,
  COLOR_NEUTRAL,
  MY_LEFT_POSE_CONNECTIONS,
  MY_RIGHT_POSE_CONNECTIONS,
  MY_NEUTRAL_POSE_CONNECTIONS,
  MY_ALL_POSEINDEX,
  MY_ALL_POSE_CONNECTIONS,
} from './pose-model';

@Injectable({
  providedIn: 'root',
})
export class PoseGridService {
  camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  light = new THREE.PointLight(0xffffff, 1);

  renderer = new THREE.WebGL1Renderer();
  geometry = new THREE.BoxGeometry();
  material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  scene = new THREE.Scene();

  constructor() {}

  lines: THREE.Line[] = [];
  spheres: THREE.Mesh[] = [];

  initGrid(gridCanvas: HTMLCanvasElement) {
    this.camera.position.z = 2;

    this.renderer.setSize(gridCanvas!.clientWidth, gridCanvas!.clientHeight);
    gridCanvas!.appendChild(this.renderer.domElement);
  }

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
          this.calculateGridConnectorsPoints(
            MY_RIGHT_POSE_CONNECTIONS,
            results
          ),
          COLOR_RIGHT
        );
        this.addGridConnectorsLines(
          this.calculateGridConnectorsPoints(
            MY_NEUTRAL_POSE_CONNECTIONS,
            results
          ),
          COLOR_NEUTRAL
        );

        this.lines.forEach((l) => {
          this.scene.add(l);
        });
        this.spheres.forEach((l) => {
          this.scene.add(l);
        });
        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);
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

    } else {
      this.hideGridConnectorsAllLines();
    }

    this.light.position.copy(this.camera.position);
    this.renderer.render(this.scene, this.camera);
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
    this.spheres.forEach((l) => {
      l.visible = false;
    });
  }
}
