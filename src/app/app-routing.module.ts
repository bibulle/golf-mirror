import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ViewerComponent } from './viewer/viewer.component';
import { HomeModule } from './home/home.module';
import { ViewerModule } from './viewer/viewer.module';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'run', component: ViewerComponent},
  {path: '**', redirectTo: ''},
];

@NgModule({
  imports: [RouterModule.forRoot(routes), HomeModule, ViewerModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }
