import { Injectable } from "@angular/core";
import { Pose, Results } from "@mediapipe/pose";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { delay, tap, withLatestFrom } from "rxjs";
import { BrowserParamsService } from "../../utils/browser-params.service";
import { PoseService } from "../../pose/pose.service";
import { VideoService } from "../../video/video.service";
import * as ViewerActions from "./viewer.actions";
import { Status, SwingSide, SwingStatus, ViewerState } from "./viewer.state";
import { anglesHistory, state } from "./viewer.selectors";
import { MyState } from "../my-state";

@Injectable()
export class ViewerEffects {
  pose_ready = false;
  pose: Pose | null = null;

  constructor(private browserParams: BrowserParamsService, private videoService: VideoService, private poseService: PoseService, private actions$: Actions, private store: Store<MyState>) {}

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
                e.name === "PermissionDeniedError" || // Chrome
                e.name === "NotAllowedError" // Firefox
              ) {
                this.store.dispatch(
                  ViewerActions.setError({
                    status: Status.PermissionDeniedError,
                  })
                );
              } else if (e.name === "NotFoundError") {
                this.store.dispatch(ViewerActions.setError({ status: Status.NotFoundError }));
              } else {
                this.store.dispatch(ViewerActions.setError({ status: Status.UnknownError }));
                console.log("Unknown error:", e);
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
          this.pose = this.poseService.initPose(this.on_results.bind(this));
          // this.pose = new Pose({
          //   locateFile: (file) => {
          //     return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          //   },
          // });
          // this.pose.setOptions({
          //   selfieMode: false,
          //   modelComplexity: 1,
          //   smoothLandmarks: true,
          //   enableSegmentation: false,
          //   smoothSegmentation: true,
          //   minDetectionConfidence: 0.5,
          //   minTrackingConfidence: 0.5,
          // });
          // this.pose.onResults(this.on_results.bind(this));
          this.pose_ready = true;

          this.store.dispatch(ViewerActions.initFinished({ now: new Date() }));
        })
      ),
    { dispatch: false }
  );

  THRESHOLD_HIPS_ALIGN_FEET = 10;
  THRESHOLD_SHOULDERS_ALIGN_FEET = 15;
  THRESHOLD_ARM_VERTICAL = 10;
  THRESHOLD_ARM_STILL = 7;

  anglesChange$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ViewerActions.setAngles),
        withLatestFrom(this.store.select(state)),
        tap(([action, state]) => {
          if (action.angles && state.anglesHistory.length >= 10) {
            const anglesHistory = state.anglesHistory;

            // Are Hip and shoulder almost align horizontaly with feets (to detect preparation)
            const areHipAlignWithFeet = Math.abs(action.angles.angleHipsFeet.hor) < this.THRESHOLD_HIPS_ALIGN_FEET;
            const areShoulderAlignWithFeet = Math.abs(action.angles.angleShouldersFeet.hor) < this.THRESHOLD_SHOULDERS_ALIGN_FEET;
            // Are Arm almost vertical (to detect preparation and impact)
            const areArmVertical = Math.abs(action.angles.angleArmsFeet.ver + 90) < this.THRESHOLD_ARM_VERTICAL;

            // How many frames are Arm almost still (to detect preparation and end)
            const armStillCount = anglesHistory.filter((a) => Math.abs(a.angleArmsFeet.tot - action.angles!.angleArmsFeet.tot) < this.THRESHOLD_ARM_STILL).length;
            // const armStillCount = anglesHistory.map((v, i, a) => [...a].splice(0, i + 1)).filter((ar) => ar.map((a) => a.angleArmsFeet.ver).every((v, i, a) => i === 0 || Math.abs(v - a[i - 1]) < this.THRESHOLD_ARM_STILL)).length;

            // How many frames are Arm moving up and down (to detect movements)
            // console.log(anglesHistory.map((v, i, a) => [...a].splice(0, i + 1)).map((ar) => ar.map((a) => a.angleArmsFeet.ver)))
            // console.log(anglesHistory.map((v, i, a) => [...a].splice(0, i + 1)).map((ar) => ar.map((a) => a.angleArmsFeet.ver).every((v, i, a) => i === 0 || v <= a[i - 1])))
            // console.log(anglesHistory.map((v, i, a) => [...a].splice(0, i + 1)).filter((ar) => ar.map((a) => a.angleArmsFeet.ver).every((v, i, a) => i === 0 || v <= a[i - 1])))
            // console.log(anglesHistory.map((v, i, a) => [...a].splice(0, i + 1)).filter((ar) => ar.map((a) => a.angleArmsFeet.ver).every((v, i, a) => i === 0 || v <= a[i - 1])).length)
            const armGoingUpCountRightHanded = anglesHistory.map((v, i, a) => [...a].splice(0, i + 1)).filter((ar) => ar.map((a) => Math.round(a.angleArmsFeet.ver)).every((v, i, a) => i === 0 || v < a[i - 1])).length;
            const armGoingDownCountRightHanded = anglesHistory.map((v, i, a) => [...a].splice(0, i + 1)).filter((ar) => ar.map((a) => Math.round(a.angleArmsFeet.ver)).every((v, i, a) => i === 0 || v > a[i - 1])).length;
            let armGoingUpCount = armGoingUpCountRightHanded;
            let armGoingDownCount = armGoingDownCountRightHanded;
            // If left handed, invert this
            if (state.swingSide === SwingSide.LeftHanded) {
              armGoingUpCount = armGoingDownCountRightHanded;
              armGoingDownCount = armGoingUpCountRightHanded;
            }

            // Are arms lower than horyzontal (to detect Takeway, backswing, ...)
            const areArmInFirstQuarter = Math.abs(action.angles.angleArmsFeet.ver + 90) <= 45;

            // if (state.swingStatus === SwingStatus.Impact) console.log(state.swingStatus, " ", areArmVertical, " ", Math.abs(action.angles.angleArmsFeet.ver + 90), " ", armGoingUpCount, " ", armGoingDownCount);
            // if (state.swingStatus === SwingStatus.DownSwing) console.log(state.swingStatus, " ", areArmVertical, " ", Math.abs(action.angles.angleArmsFeet.ver + 90), " ", armGoingUpCount, " ", armGoingDownCount);
            //console.log(state.swingStatus, " ", areHipAlignWithFeet, " ", areShoulderAlignWithFeet, " ", areArmVertical, " ", areArmsStill);
            // console.log(state.swingStatus, " ", armStillCount, " ", armGoingUpCount, " ", armGoingDownCount," ",areArmInFirstQuarter);

            // Calculate potential changes in state
            const potentialPreparation = areHipAlignWithFeet && areShoulderAlignWithFeet && areArmVertical && armStillCount > 4;
            const potentialTakewayRightHanded = armStillCount < 7 && areArmInFirstQuarter && armGoingUpCount > 7;
            const potentialTakewayLeftHanded = armStillCount < 7 && areArmInFirstQuarter && armGoingDownCount > 7;
            const potentialBackSwing = !areArmInFirstQuarter && armGoingUpCount > 5;
            const potentialDownswing = armGoingDownCount > 2;
            const potentialImpact = areArmVertical;
            const potentialTraverse = areArmInFirstQuarter && armGoingDownCount > 2;
            const potentialFinish = !areArmInFirstQuarter && armGoingDownCount > 6;
            const potentialDone = armStillCount > 5;

            // console.log(state.swingStatus, " ", armStillCount, " ", potentialPreparation, " ", potentialTakewayRightHanded, " ", potentialTakewayLeftHanded);

            // Manage state
            if (state.swingStatus === SwingStatus.None && potentialPreparation) {
              this.store.dispatch(
                ViewerActions.setSwingStatus({
                  status: SwingStatus.Preparation,
                  side: SwingSide.Unknown,
                  now: new Date(),
                })
              );
            } else if ([SwingStatus.None, SwingStatus.Preparation].includes(state.swingStatus) && potentialTakewayRightHanded) {
              this.store.dispatch(
                ViewerActions.setSwingStatus({
                  status: SwingStatus.Takeway,
                  side: SwingSide.RightHanded,
                  now: new Date(),
                })
              );
            } else if ([SwingStatus.None, SwingStatus.Preparation].includes(state.swingStatus) && potentialTakewayLeftHanded) {
              this.store.dispatch(
                ViewerActions.setSwingStatus({
                  status: SwingStatus.Takeway,
                  side: SwingSide.LeftHanded,
                  now: new Date(),
                })
              );
            } else if (state.swingStatus === SwingStatus.Takeway && potentialBackSwing) {
              this.store.dispatch(
                ViewerActions.setSwingStatus({
                  status: SwingStatus.BackSwing,
                  now: new Date(),
                })
              );
            } else if (state.swingStatus === SwingStatus.BackSwing && potentialDownswing) {
              this.store.dispatch(
                ViewerActions.setSwingStatus({
                  status: SwingStatus.DownSwing,
                  now: new Date(),
                })
              );
            } else if (state.swingStatus === SwingStatus.DownSwing && potentialImpact) {
              this.store.dispatch(
                ViewerActions.setSwingStatus({
                  status: SwingStatus.Impact,
                  now: new Date(),
                })
              );
            } else if (state.swingStatus === SwingStatus.Impact && potentialTraverse) {
              this.store.dispatch(
                ViewerActions.setSwingStatus({
                  status: SwingStatus.Traversé,
                  now: new Date(),
                })
              );
            } else if ([SwingStatus.Impact, SwingStatus.Traversé].includes(state.swingStatus) && potentialFinish) {
              this.store.dispatch(
                ViewerActions.setSwingStatus({
                  status: SwingStatus.Finish,
                  now: new Date(),
                })
              );
            } else if (state.swingStatus === SwingStatus.Finish && potentialDone) {
              this.store.dispatch(
                ViewerActions.setSwingStatus({
                  status: SwingStatus.None,
                  side: SwingSide.Unknown,
                  now: new Date(),
                })
              );
            }

            // // do we start a swing ?
            // const startOk = Math.abs(action.angles.angleHipsFeet.hor) < 10 && Math.abs(action.angles.angleShouldersFeet.hor) < 15;
            // this.store.dispatch(
            //   ViewerActions.setSwingReferenceStart({
            //     ok: startOk,
            //     now: new Date(),
            //   })
            // );

            // // do we stop a swing ? (not moving)
            // const average = state.anglesHistory.length < 10 ? Infinity : state.anglesHistory.reduce((p, v) => p + v.angleArmsFeet.tot, 0) / state.anglesHistory.length;
            // const stopOk = Math.abs(action.angles.angleArmsFeet.tot - average) < 2;
            // this.store.dispatch(
            //   ViewerActions.setSwingReferenceStop({
            //     ok: stopOk,
            //     now: new Date(),
            //   })
            // );
          }
        })
      ),
    { dispatch: false }
  );

  /* Manage a frame */
  async playingFrame() {
    // console.log(this);

    if (this.pose_ready && this.videoService.liveVideo && this.videoService.outputCanvas) {
      this.videoService.outputCanvas.width = this.videoService.liveVideo?.videoWidth;
      this.videoService.outputCanvas.height = this.videoService.liveVideo?.videoHeight;

      await this.pose!.send({
        image: this.videoService.liveVideo!,
      });
    }
    window.requestAnimationFrame(() => {
      this.playingFrame();
    });
  }

  async on_results(results: Results) {
    //console.log(results);
    // console.log(this);
    this.poseService.enhanceResults(results);

    this.store.dispatch(ViewerActions.setAngles(this.poseService.calculateAngles(results)));

    this.poseService.drawPoses(results);
  }
}
