import { createReducer, on } from "@ngrx/store";
import { DebugState, initialState } from "./debug.state";
import * as DebugActions from './debug.actions';

export const reducer = createReducer(
  initialState,
  on(
    DebugActions.init,
    (state: DebugState) => {

      // process.env
      return {
        ...state,
      }

    }
  ),
);