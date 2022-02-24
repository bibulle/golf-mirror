import { createAction, props } from '@ngrx/store';
import { Status } from './viewer.state';

export const init = createAction('[View System] Init');
export const initVideoDone = createAction('[View System] Init Video done');
export const initFinished = createAction(
  '[View Effect] Finish Init',
  props<{ now: Date }>()
);

export const setError = createAction(
  '[View Effect] Set error',
  props<{
    status: Status;
  }>()
);
