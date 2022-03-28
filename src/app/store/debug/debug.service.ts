import { Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { BehaviorSubject, distinct, map, Observable, Subject, tap } from "rxjs";

export interface DebugState {
  calculatePoseOff: boolean;
  showAngles: boolean
}

@Injectable({
  providedIn: "root",
})
export class DebugService {
  params: DebugState = {
    calculatePoseOff: false,
    showAngles: true
  };

  paramSubject = new BehaviorSubject<DebugState>(this.params);
  paramChange$: Observable<DebugState>;

  constructor(private route: ActivatedRoute) {
    this.paramChange$ = this.paramSubject.asObservable().pipe(distinct(s => JSON.stringify(s)));
    this.paramSubject.next(this.params);

    this.paramChange$.subscribe((v) => {
       this.params = v;
    });

    this.route.queryParams
      .pipe(
        map((params) => {
          const newState:any = { ...this.params };

          Object.keys(newState).forEach(key => {
            if (params[key] !== undefined) {
              newState[key] = params[key].toLowerCase() === 'true';
            }
          });
          return newState
        })
      )
      .subscribe((v) => {
        this.paramSubject.next(v);
      });

  }
}
