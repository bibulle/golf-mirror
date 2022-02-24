import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ViewerState } from "./viewer.state";

export const viewerStateSelector = createFeatureSelector<ViewerState>('viewer');

export const statusSelector = createSelector(
  viewerStateSelector,
  (state: ViewerState) => state.status,
);