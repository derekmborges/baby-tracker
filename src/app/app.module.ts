import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { IonicStorageModule } from '@ionic/storage';
import { StorageService } from './services/storage.service';
import { FeedingHistoryModalComponent } from './feeding/feeding-history-modal/feeding-history-modal.component';
import { SleepHistoryModalComponent } from './sleep/sleep-history-modal/sleep-history-modal.component';
import { FeedingEditModalComponent } from './feeding/feeding-edit-modal/feeding-edit-modal.component';
import { SleepEditModalComponent } from './sleep/sleep-edit-modal/sleep-edit-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    FeedingHistoryModalComponent,
    FeedingEditModalComponent,
    SleepHistoryModalComponent,
    SleepEditModalComponent
  ],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot({
      mode: 'ios'
    }),
    IonicStorageModule.forRoot(),
    AppRoutingModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    StorageService,
    ScreenOrientation
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
