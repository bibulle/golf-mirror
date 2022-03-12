import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { tap } from "rxjs";
import { MyState } from "../my-state";
import { Status } from "../viewer/viewer.state";
import { DebugService } from "./debug.service";
import * as DebugActions from "./debug.actions";


@Injectable()
export class DebugEffects {

  constructor(private debugService: DebugService, private actions$: Actions, private store: Store<MyState>) {}

  init$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(DebugActions.init),
        tap(() => {
          //console.log('Effect on init');

          this.debugService
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

}