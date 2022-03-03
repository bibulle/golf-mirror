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
import { PoseModule } from './pose/pose.module';
import { VideoModule } from './video/video.module';
import { MyStoreModule } from './store/my-store.module';

@NgModule({
  declarations: [
    AppComponent,
    // HomeComponent,
    // ViewerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PoseModule,
    VideoModule,
    MyStoreModule

  ],
  providers: [BrowserParamsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
