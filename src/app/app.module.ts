import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ViewerEffects } from './store/viewer/viewer.effects';
import * as ViewerReducer from "./store/viewer/viewer.reducer"
import { BrowserParamsService } from './utils/browser-params.service';
import { HomeComponent } from './home/home.component';
import { ViewerComponent } from './viewer/viewer.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ViewerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    StoreModule.forRoot({viewer: ViewerReducer.reducer}),
    EffectsModule.forRoot([ViewerEffects])

  ],
  providers: [BrowserParamsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
