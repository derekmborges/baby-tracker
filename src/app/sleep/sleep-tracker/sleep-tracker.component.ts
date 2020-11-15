import { Component, NgZone, OnInit } from '@angular/core';
import { ToastController, ModalController, Platform } from '@ionic/angular';
import { formatTimeString } from 'src/app/helpers/date-helpers';
import { Sleep } from 'src/app/models/sleep';
import { StorageService } from 'src/app/services/storage.service';
import * as moment from 'moment';
import { SleepHistoryModalComponent } from '../sleep-history-modal/sleep-history-modal.component';

@Component({
  selector: 'app-sleep-tracker',
  templateUrl: './sleep-tracker.component.html',
  styleUrls: ['./sleep-tracker.component.scss'],
})
export class SleepTrackerComponent implements OnInit {
  currentSleep: Sleep;
  previousSleep: Sleep;
  allSleep: Sleep[];

  sleepCounter: string;
  sleepCounterTimer: any;

  constructor(
    public platform: Platform,
    public toastController: ToastController,
    public modalController: ModalController,
    private ngZone: NgZone,
    private storageService: StorageService
  ) { }

  get isAwake(): boolean {
    return this.currentSleep === undefined
        || this.currentSleep === null;
  }

  async ngOnInit() {
    this.currentSleep = await this.storageService.getCurrentSleep();
    this.previousSleep = await this.storageService.getPreviousSleep();
    this.allSleep = await this.storageService.getAllSleep();
    if (this.currentSleep) {
      this.updateSleepCounter();
    }

    // register pause and resume events
    this.platform.pause.subscribe(() => {
      console.log('app paused');
      clearInterval(this.sleepCounterTimer);
      this.sleepCounterTimer = undefined;
    });
    this.platform.resume.subscribe(() => {
      this.ngZone.run(() => {
        console.log('app resumed');
        if (!this.isAwake) {
          this.updateSleepCounter();
        }
      });
    });
  }

  toTimeString(date: Date): string {
    return formatTimeString(date);
  }

  updateSleepCounter() {
    const currentTimeMoment = moment();
    const sleepTimeMoment = moment(this.currentSleep.sleepTime);
    const duration = moment.duration(currentTimeMoment.diff(sleepTimeMoment));
    this.sleepCounter = `${duration.hours().toString().padStart(2, '0')}:`
                      + `${duration.minutes().toString().padStart(2, '0')}:`
                      + `${duration.seconds().toString().padStart(2, '0')}`;

    // repeatedly update counter
    if (!this.sleepCounterTimer) {
      this.sleepCounterTimer = setInterval(() => this.updateSleepCounter(), 1000);
    }
  }

  toggleSleep() {
    if (this.isAwake) {
      this.startSleep();
    }
    else {
      this.endSleep();
    }
  }

  async startSleep() {
    // initialize sleep object
    this.currentSleep = {
      sleepTime: new Date()
    } as Sleep;

    // store sleep object for persistence
    await this.storageService.saveCurrentSleep(this.currentSleep);

    // let user know the sleep has been stored
    const toast = await this.toastController.create({
      message: 'Sleep started',
      duration: 3000,
      color: 'dark'
    });
    toast.present();

    // start sleep counter
    this.updateSleepCounter();
  }

  async endSleep() {
    // set the wake time
    this.currentSleep.wakeTime = new Date();

    // store the completed sleep
    await this.storageService.saveCompleteSleep(this.currentSleep);

    // let user know the completed sleep is saved
    const toast = await this.toastController.create({
      message: 'Sleep ended',
      duration: 3000,
      color: 'dark'
    });
    toast.present();

    // re-retrieve sleep data
    this.ngOnInit();

    // stop sleep counter
    clearInterval(this.sleepCounterTimer);
  }

  async showSleepHistory() {
    const sleepModal = await this.modalController.create({
      component: SleepHistoryModalComponent,
      swipeToClose: true
    });
    await sleepModal.present();
    await sleepModal.onDidDismiss();
    this.ngOnInit();
  }

}
