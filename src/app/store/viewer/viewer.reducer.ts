import { createReducer, on } from '@ngrx/store';
import { initialState, Status, SwingStatus, ViewerState } from './viewer.state';
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
  ),
  on(ViewerActions.setAngles, (state, action): ViewerState => {
    if (action.angles) {
    const history = [...state.anglesHistory].splice(0, 9);
    history.unshift(action.angles);
    return {
        ...state,
        angles: action.angles,
        anglesHistory: history
      };
    } else {
      return state;
    }
  }),
  on(ViewerActions.setSwingStatus, (state, action): ViewerState => {
    const swingReferences = {
      isStarted: state.swingReferences.isStarted,
      timeStarted: state.swingReferences.timeStarted,
      timeStop: state.swingReferences.timeStop
    } ;
    if (action.status === SwingStatus.None && swingReferences.isStarted) {
      swingReferences.isStarted = false;
      swingReferences.timeStop = action.now;
    } else if (action.status !== SwingStatus.None && !swingReferences.isStarted) {
      swingReferences.isStarted = true;
      swingReferences.timeStarted = action.now;
      swingReferences.timeStop = null;
    }
    return {
        ...state,
        swingStatus: action.status,
        swingSide: action.side ? action.side : state.swingSide,
        swingReferences: swingReferences,
      };
  }),
  // on(ViewerActions.setSwingReferenceStart, (state, action): ViewerState => {
  //   if (state.swingReferences.isStarted) {
  //     return state;
  //   } else {
  //     if (!action.ok) {
  //       return {
  //         ...state,
  //         swingReferences: {
  //           isStarted: false,
  //           timeStarted: null,
  //           timeStop: null
  //         }
  //       }
  //     } else {
  //       if (!state.swingReferences.timeStarted) {
  //         return {
  //           ...state,
  //           swingReferences: {
  //             isStarted: false,
  //             timeStarted: action.now,
  //             timeStop: null
  //           }
  //         }
  //         } else {
  //           return {
  //             ...state,
  //             swingReferences: {
  //               isStarted: (action.now.getTime()-state.swingReferences.timeStarted.getTime() > 200),
  //               timeStarted: state.swingReferences.timeStarted,
  //               timeStop: null
  //             }
  //           }
  //       }
  //     }
  //   }
  // }),
  // on(ViewerActions.setSwingReferenceStop, (state, action): ViewerState => {
  //   if (!state.swingReferences.isStarted) {
  //     return state;
  //   } else {
  //     if (!action.ok || (action.now.getTime()-state.swingReferences.timeStarted!.getTime() < 500)) {
  //       return {
  //         ...state,
  //         swingReferences: {
  //           isStarted: true,
  //           timeStarted: state.swingReferences.timeStarted,
  //           timeStop: null
  //         }
  //       }
  //     } else {
  //       if (!state.swingReferences.timeStop) {
  //         return {
  //           ...state,
  //           swingReferences: {
  //             isStarted: false,
  //             timeStarted: state.swingReferences.timeStarted,
  //             timeStop: action.now
  //           }
  //         }
  //         } else {
  //           return {
  //             ...state,
  //             swingReferences: {
  //               isStarted: (action.now.getTime()-state.swingReferences.timeStop.getTime() > 500),
  //               timeStarted: state.swingReferences.timeStarted,
  //               timeStop: state.swingReferences.timeStop
  //             }
  //           }
  //       }
  //     }
  //   }
  // })
);
