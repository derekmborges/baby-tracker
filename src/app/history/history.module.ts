import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HistoryPageRoutingModule } from './history-routing.module';
import { HistoryComponent } from './history.component';

@NgModule({
    imports: [
      IonicModule,
      CommonModule,
      FormsModule,
      HistoryPageRoutingModule
    ],
    declarations: [HistoryComponent]
  })
  export class HistoryPageModule {}
