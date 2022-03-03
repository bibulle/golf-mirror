import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ViewerState } from './viewer.state';

export const viewerStateSelector = createFeatureSelector<ViewerState>('viewer');

export const statusSelector = createSelector(
  viewerStateSelector,
  (state: ViewerState) => state.status
);

export const state = createSelector(
  viewerStateSelector,
  (state: ViewerState) => state
);

export const angleHipsFeetHorizontal = createSelector(
  viewerStateSelector,
  (state: ViewerState) => state.angles.angleHipsFeet.hor
);
export const angleHipsFeetTotal = createSelector(
  viewerStateSelector,
  (state: ViewerState) => state.angles.angleHipsFeet.tot
);
export const angleHipsFeetVertical = createSelector(
  viewerStateSelector,
  (state: ViewerState) => state.angles.angleHipsFeet.ver
);
export const angleShouldersFeetHorizontal = createSelector(
  viewerStateSelector,
  (state: ViewerState) => state.angles.angleShouldersFeet.hor
);
export const angleShouldersFeetTotal = createSelector(
  viewerStateSelector,
  (state: ViewerState) => state.angles.angleShouldersFeet.tot
);
export const angleShouldersFeetVertical = createSelector(
  viewerStateSelector,
  (state: ViewerState) => state.angles.angleShouldersFeet.ver
);
export const angleArmsFeetHorizontal = createSelector(
  viewerStateSelector,
  (state: ViewerState) => state.angles.angleArmsFeet.hor
);
export const angleArmsFeetTotal = createSelector(
  viewerStateSelector,
  (state: ViewerState) => state.angles.angleArmsFeet.tot
);
export const angleArmsFeetVertical = createSelector(
  viewerStateSelector,
  (state: ViewerState) => state.angles.angleArmsFeet.ver
);

export const anglesHistory = createSelector(
  viewerStateSelector,
  (state: ViewerState) => state.anglesHistory
);

export const swingStatus = createSelector(
  viewerStateSelector,
  (state: ViewerState) => state.swingStatus
);
export const swingSide = createSelector(
  viewerStateSelector,
  (state: ViewerState) => state.swingSide
);
export const swingReferencesIsStarted = createSelector(
  viewerStateSelector,
  (state: ViewerState) => state.swingReferences.isStarted
);
export const swingReferencesTimeStarted = createSelector(
  viewerStateSelector,
  (state: ViewerState) => state.swingReferences.timeStarted
);
