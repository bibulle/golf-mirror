
export interface State {
  viewer: ViewerState;
}

export enum Status {
  Success,
  PermissionDeniedError,
  UnknownError,
  NotFoundError,
}

export interface ViewerState {
  timeStarted: Date | null;
  isInitialized: boolean;
  status: Status;
}

export const initialState: ViewerState = {
  timeStarted: null,
  isInitialized: false,
  status: Status.Success,
};
