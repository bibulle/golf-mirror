import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, Subject } from 'rxjs';
import { DebugState, initialState } from './debug.state';

@Injectable({
  providedIn: 'root'
})
export class DebugService {

  params: DebugState = initialState; 

    paramSubject = new Subject<DebugState>(this.params);
    paramChange$: Observable<DebugState>;

    constructor(private route: ActivatedRoute) {
      this.route.queryParams.pipe(
        map((params) => {
          return Number(params['video']);
        }),
      ).subscribe((b) => {
        console.log(b);
      });
    }
}
