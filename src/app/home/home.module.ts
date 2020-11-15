import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { FeedingTrackerComponent } from '../feeding/feeding-tracker/feeding-tracker.component';
import { SleepTrackerComponent } from '../sleep/sleep-tracker/sleep-tracker.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule
  ],
  declarations: [
    HomePage,
    FeedingTrackerComponent,
    SleepTrackerComponent
  ]
})
export class HomePageModule {}
