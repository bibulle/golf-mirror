import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { VideoService } from '../store/viewer/video.service';
import * as ViewerSelectors from '../store/viewer/viewer.selectors';
import * as ViewerActions from '../store/viewer/viewer.actions';
import { State, Status, ViewerState } from '../store/viewer/viewer.state';
import { BrowserParamsService } from '../utils/browser-params.service';

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss']
})
export class ViewerComponent implements OnInit {

  status$: Observable<Status>;
  isInitialized$: Observable<boolean>;

  constructor(    browserParams: BrowserParamsService,
    private videoService: VideoService,
    private store: Store<State>,
    private route: ActivatedRoute,
) { 
  this.status$ = store.pipe(
    select(ViewerSelectors.viewerStateSelector),
    map((s: ViewerState) => s.status),
  );
  this.isInitialized$ = store.pipe(
    select(ViewerSelectors.viewerStateSelector),
    map((s: ViewerState) => s.isInitialized),
  );
}

  ngOnInit(): void {
    this.store.dispatch(ViewerActions.init());

    this.videoService.liveVideo = document.querySelector('#live') as HTMLVideoElement;
    this.videoService.canvasMask = document.querySelector('#canvas-mask') as HTMLCanvasElement;
  }

}
