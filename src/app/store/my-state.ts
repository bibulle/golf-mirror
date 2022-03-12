import { DebugState } from "./debug/debug.state";
import { ViewerState } from "./viewer/viewer.state";

export interface MyState {
  viewer: ViewerState;
  debug: DebugState;
}
