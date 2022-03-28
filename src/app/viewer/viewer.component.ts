import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { VideoService } from '../video/video.service';
import * as ViewerSelectors from '../store/viewer/viewer.selectors';
import * as ViewerActions from '../store/viewer/viewer.actions';
import { PersonAngles, Status, SwingSide, SwingStatus, ViewerState } from '../store/viewer/viewer.state';
import { BrowserParamsService } from '../utils/browser-params.service';
import { MyState } from '../store/my-state';
import { DebugService } from '../store/debug/debug.service';

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss']
})
export class ViewerComponent implements OnInit {

  showAngles = false;

  status$: Observable<Status>;
  isInitialized$: Observable<boolean>;

  angleHipsFeetHorizontal$: Observable<number>
  angleHipsFeetTotal$: Observable<number>
  angleHipsFeetVertical$: Observable<number>
  angleShouldersFeetHorizontal$: Observable<number>
  angleShouldersFeetTotal$: Observable<number>
  angleShouldersFeetVertical$: Observable<number>
  angleArmsFeetHorizontal$: Observable<number>
  angleArmsFeetTotal$: Observable<number>
  angleArmsFeetVertical$: Observable<number>

  swingReferencesIsStarted$: Observable<boolean>
  swingStatus$: Observable<SwingStatus>
  swingSide$: Observable<SwingSide>

  constructor(    browserParams: BrowserParamsService,
    private videoService: VideoService,
    private store: Store<MyState>,
    private route: ActivatedRoute,
    private debugService: DebugService,
) { 

  this.debugService.paramChange$.subscribe(d => {
    this.showAngles = d.showAngles;
  })

  this.status$ = store.pipe(
    select(ViewerSelectors.viewerStateSelector),
    map((s: ViewerState) => s.status),
  );
  this.isInitialized$ = store.pipe(
    select(ViewerSelectors.viewerStateSelector),
    map((s: ViewerState) => s.isInitialized),
  );
  this.angleHipsFeetHorizontal$ = store.pipe(select(ViewerSelectors.angleHipsFeetHorizontal));
  this.angleHipsFeetTotal$ = store.pipe(select(ViewerSelectors.angleHipsFeetTotal));
  this.angleHipsFeetVertical$ = store.pipe(select(ViewerSelectors.angleHipsFeetVertical));
  this.angleShouldersFeetHorizontal$ = store.pipe(select(ViewerSelectors.angleShouldersFeetHorizontal));
  this.angleShouldersFeetTotal$ = store.pipe(select(ViewerSelectors.angleShouldersFeetTotal));
  this.angleShouldersFeetVertical$ = store.pipe(select(ViewerSelectors.angleShouldersFeetVertical));
  this.angleArmsFeetHorizontal$ = store.pipe(select(ViewerSelectors.angleArmsFeetHorizontal));
  this.angleArmsFeetTotal$ = store.pipe(select(ViewerSelectors.angleArmsFeetTotal));
  this.angleArmsFeetVertical$ = store.pipe(select(ViewerSelectors.angleArmsFeetVertical));
  this.swingReferencesIsStarted$ = store.pipe(select(ViewerSelectors.swingReferencesIsStarted));
  this.swingStatus$ = store.pipe(select(ViewerSelectors.swingStatus));
  this.swingSide$ = store.pipe(select(ViewerSelectors.swingSide));
}

  ngOnInit(): void {
    this.videoService.liveVideo = document.querySelector('#live') as HTMLVideoElement;
    this.videoService.outputCanvas = document.querySelector('#output-canvas') as HTMLCanvasElement;
    this.videoService.gridCanvas = document.querySelector('#landmark-grid-container') as HTMLCanvasElement;

    this.store.dispatch(ViewerActions.init());

  }

}
