
export interface Angles {
  hor: number;
  ver: number;
  tot: number;
}
export interface PersonAngles {
  angleHipsFeet: Angles;
  angleShouldersFeet: Angles;
  angleArmsFeet: Angles;
}
export enum SwingStatus {
  None= "None",
  Preparation= "Preparation",
  Takeway= "Takeway",
  BackSwing= "BackSwing",
  DownSwing= "DownSwing",
  Impact= "Impact",
  Traversé= "Traversé",
  Finish= "Finish"
}
export enum SwingSide {
  Unknown= "Unknown",
  RightHanded= "RightHanded",
  LeftHanded= "LeftHanded"
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
  swingStatus: SwingStatus;
  swingSide: SwingSide;
  angles: PersonAngles;
  anglesHistory: PersonAngles[];
  swingReferences: {
    isStarted: boolean;
    timeStarted: Date | null;
    timeStop: Date | null;
  }
}

export const initialState: ViewerState = {
  timeStarted: null,
  isInitialized: false,
  status: Status.Success,
  swingStatus: SwingStatus.None,
  swingSide: SwingSide.Unknown,
  angles: {
    angleHipsFeet: { hor: NaN, ver: NaN, tot: NaN },
    angleShouldersFeet: { hor: NaN, ver: NaN, tot: NaN },
    angleArmsFeet: { hor: NaN, ver: NaN, tot: NaN },
  },
  anglesHistory: [],
  swingReferences: {
    isStarted: false,
    timeStarted: null,
    timeStop: null
  }
};

