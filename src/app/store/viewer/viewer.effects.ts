import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BrowserParamsService } from '../../utils/browser-params.service';
import { VideoService } from './video.service';
import { State, Status } from './viewer.state';
import * as ViewerActions from './viewer.actions';
import { delay, tap } from 'rxjs';
import { Results, SelfieSegmentation } from '@mediapipe/selfie_segmentation';

@Injectable()
export class ViewerEffects {
  selfie_segmentation_ready = false;
  selfie_segmentation: SelfieSegmentation | null = null;

  constructor(
    private browserParams: BrowserParamsService,
    private videoService: VideoService,
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

          // Initial the webcam
          navigator.mediaDevices
            .getUserMedia({
              video: {
                facingMode: localStorage.getItem('videoCamera') || 'user',
                height: parseInt(
                  localStorage.getItem('videoQuality') || '720p'
                ),
              },
            })
            .then((media_stream) => {

              // Assign media stream to video element - with audio muted
              this.videoService.liveVideo!.srcObject = media_stream;
              this.videoService.liveVideo!.muted = true;

              this.videoService.liveVideo!.onplay =
                this.playingFrame.bind(this);

              // And start playing
              this.videoService.liveVideo!.play();

              this.store.dispatch(
                ViewerActions.initVideoDone()
              );

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
          this.selfie_segmentation = new SelfieSegmentation({
            locateFile: (file) => {
              return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
            },
          });
          this.selfie_segmentation.setOptions({ modelSelection: 1 });
          this.selfie_segmentation.onResults(this.on_results.bind(this));
          this.selfie_segmentation_ready = true;
          // },1000)

          this.store.dispatch(
            ViewerActions.initFinished({ now: new Date() })
          );

        })
      ),
    { dispatch: false }
  );

  /* Manage a frame */
  async playingFrame() {
    // console.log(this);

    if (this.selfie_segmentation_ready && this.videoService.liveVideo) {
      await this.selfie_segmentation!.send({
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

    const c = this.videoService.canvasMask;
    const ctx = c!.getContext('2d');
    ctx!.clearRect(0, 0, c!.width, c!.height);
    ctx!.drawImage(results.segmentationMask, 0, 0, c!.width, c!.height);
  }
}
