import { Injectable } from '@angular/core';
import * as DrawingUtils from '@mediapipe/drawing_utils';
import {
  Pose,
  POSE_LANDMARKS,
  POSE_LANDMARKS_LEFT,
  POSE_LANDMARKS_RIGHT,
  Results,
} from '@mediapipe/pose';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { delay, tap } from 'rxjs';
import { BrowserParamsService } from '../../utils/browser-params.service';
import { COLOR_LEFT, COLOR_NEUTRAL, COLOR_RIGHT, MY_LEFT_POSEINDEX, MY_NEUTRAL_POSEINDEX, MY_POSE_CONNECTIONS, MY_POSE_CONNECTIONS_PERSON_LEFT, MY_POSE_CONNECTIONS_PERSON_RIGHT, MY_RIGHT_POSEINDEX, PoseService } from './pose.service';
import { VideoService } from './video.service';
import * as ViewerActions from './viewer.actions';
import { State, Status } from './viewer.state';

@Injectable()
export class ViewerEffects {
  pose_ready = false;
  pose: Pose | null = null;

  constructor(
    private browserParams: BrowserParamsService,
    private videoService: VideoService,
    private poseService: PoseService,
    private actions$: Actions,
    private store: Store<State>
  ) {}

  /* Initialisation */
  init$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ViewerActions.init),
        tap(() => {
          //console.log('Effect on init');

          this.videoService
            .initInputVideo(this.playingFrame.bind(this))
            .then(() => {
              this.store.dispatch(ViewerActions.initVideoDone());
            })
            .catch((e) => {
              if (
                e.name === 'PermissionDeniedError' || // Chrome
                e.name === 'NotAllowedError' // Firefox
              ) {
                this.store.dispatch(
                  ViewerActions.setError({
                    status: Status.PermissionDeniedError,
                  })
                );
              } else if (e.name === 'NotFoundError') {
                this.store.dispatch(
                  ViewerActions.setError({ status: Status.NotFoundError })
                );
              } else {
                this.store.dispatch(
                  ViewerActions.setError({ status: Status.UnknownError })
                );
                console.log('Unknown error:', e);
              }
            });
        })
      ),
    { dispatch: false }
  );

  initMediaPipe$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ViewerActions.initVideoDone),
        delay(1000),
        tap(() => {
          // initial the selfie segmentation
          // setTimeout(() => {
          this.pose = new Pose({
            locateFile: (file) => {
              return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
            },
          });
          this.pose.setOptions({
            selfieMode: false,
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            smoothSegmentation: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });
          this.pose.onResults(this.on_results.bind(this));
          this.pose_ready = true;

          this.store.dispatch(ViewerActions.initFinished({ now: new Date() }));
        })
      ),
    { dispatch: false }
  );

  /* Manage a frame */
  async playingFrame() {
    // console.log(this);

    if (
      this.pose_ready &&
      this.videoService.liveVideo &&
      this.videoService.outputCanvas
    ) {
      this.videoService.outputCanvas.width =
        this.videoService.liveVideo?.videoWidth;
      this.videoService.outputCanvas.height =
        this.videoService.liveVideo?.videoHeight;

      await this.pose!.send({
        image: this.videoService.liveVideo!,
      });
    }
    window.requestAnimationFrame(() => {
      this.playingFrame();
    });
  }

  

  async on_results(results: Results) {
    // console.log(results);
    // console.log(this);
    this.poseService.drawCanvas(results);
  
  }
}
