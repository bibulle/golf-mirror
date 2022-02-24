import { createReducer, on } from '@ngrx/store';
import { initialState, Status, ViewerState } from './viewer.state';
import * as ViewerActions from './viewer.actions';

export const reducer = createReducer(
  initialState,
  on(
    ViewerActions.init,
    (state): ViewerState => ({
      ...state,
      status: Status.Success,
    })
  ),
  on(
    ViewerActions.setError,
    (state, action): ViewerState => ({
      ...state,
      status: action.status,
    })
  ),
  on(
    ViewerActions.initFinished,
    (state, action): ViewerState => ({
      ...state,
      timeStarted: action.now,
      isInitialized: true,
    })
  )
);
