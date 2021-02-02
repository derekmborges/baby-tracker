import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CounterComponent } from '../components/counter/counter.component';
import { FeedingPageRoutingModule } from './feeding-routing.module';
import { FeedingComponent } from './feeding.component';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        FeedingPageRoutingModule
    ],
    declarations: [
        FeedingComponent,
        CounterComponent
    ]
})
export class FeedingPageModule {}
