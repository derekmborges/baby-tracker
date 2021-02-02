import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SleepComponent } from './sleep.component';
import { SleepPageRoutingModule } from './sleep-routing.module';

@NgModule({
    imports: [
      IonicModule,
      CommonModule,
      FormsModule,
      SleepPageRoutingModule
    ],
    declarations: [SleepComponent]
  })
export class SleepPageModule {}
