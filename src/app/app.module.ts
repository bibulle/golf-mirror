import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PoseModule } from './pose/pose.module';
import { MyStoreModule } from './store/my-store.module';
import { BrowserParamsService } from './utils/browser-params.service';
import { VideoModule } from './video/video.module';


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
