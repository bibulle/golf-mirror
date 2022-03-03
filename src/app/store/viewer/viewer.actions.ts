import { createAction, props } from '@ngrx/store';
import { PersonAngles, Status, SwingSide, SwingStatus } from './viewer.state';

export const init = createAction('[View System] Init');
export const initVideoDone = createAction('[View System] Init Video done');
export const initFinished = createAction(
  '[View Effect] Finish Init',
  props<{ now: Date }>()
);

export const setError = createAction(
  '[View Effect] Set error',
  props<{ status: Status }>()
);

export const setAngles = createAction(
  '[View Effect] Set angles',
  props<{ angles?: PersonAngles }>()
);

export const setSwingStatus = createAction(
  '[View Effect] Set swing status',
  props<{ status: SwingStatus, side?: SwingSide, now: Date }>()
);
export const setSwingReferenceStart = createAction(
  '[View Effect] Angles ok (or not) with starting swing',
  props<{ ok: boolean, now: Date }>()
);
export const setSwingReferenceStop = createAction(
  '[View Effect] Angles show no more moves',
  props<{ ok: boolean, now: Date }>()
);
