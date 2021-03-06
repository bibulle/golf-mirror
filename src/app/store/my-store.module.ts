import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { ViewerEffects } from './viewer/viewer.effects';
import * as ViewerReducer from "./viewer/viewer.reducer"



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forRoot({viewer: ViewerReducer.reducer}),
    EffectsModule.forRoot([ViewerEffects])
  ]
})
export class MyStoreModule { }
