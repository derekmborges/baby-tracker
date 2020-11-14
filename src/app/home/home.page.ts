import { Component, OnInit } from '@angular/core';
import { Feeding } from '../models/feeding';
import { Sleep } from '../models/sleep';
import * as moment from 'moment';
import { ModalController, Platform, ToastController } from '@ionic/angular';
import { StorageService } from '../services/storage.service';
import { FeedingHistoryModalComponent } from '../feeding/feeding-history-modal/feeding-history-modal.component';
import { SleepHistoryModalComponent } from '../sleep/sleep-history-modal/sleep-history-modal.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  currentDate: Date = new Date();

  // current events
  currentSleep: Sleep;
  currentFeeding: Feeding;
  sleepCounter: string;
  sleepCounterTimer: any;

  // previous events
  previousSleep: Sleep;
  previousFeeding: Feeding;

  constructor(
    public platform: Platform,
    public toastController: ToastController,
    public modalController: ModalController,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    this.loadDataFromStorage();

    // initialize feeding
    this.currentFeeding = {
      ounces: 1,
    } as Feeding;

    // register pause and resume events
    this.platform.pause.subscribe(() => {
      console.log('app paused');
      clearInterval(this.sleepCounterTimer);
    });
    this.platform.resume.subscribe(() => {
      console.log('app resumed');
      if (this.currentSleep) {
        this.updateSleepCounter();
      }
    });
  }

  async loadDataFromStorage() {
    // retrieve current sleep
    this.currentSleep = await this.storageService.getCurrentSleep();
    console.log('current sleep:', this.currentSleep);

    // if loading page during sleep - show counter
    if (this.currentSleep) {
      this.updateSleepCounter();
    }

    // retrieve previous sleep
    this.previousSleep = await this.storageService.getPreviousSleep();
    console.log('previous sleep:', this.previousSleep);

    // retrieve previous feeding
    this.previousFeeding = await this.storageService.getPreviousFeeding();
    console.log('previous feeding:', this.previousFeeding);
  }

  get isAwake(): boolean {
    return this.currentSleep === undefined
        || this.currentSleep === null;
  }

  formatTimeString(date: Date): string {
    return moment(date).format('h:mm A');
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

    // re-retrieve previous sleep
    this.previousSleep = await this.storageService.getPreviousSleep();

    // clear current sleep object
    this.currentSleep = null;

    // stop sleep counter
    clearInterval(this.sleepCounterTimer);
  }

  addOunce() {
    this.currentFeeding.ounces++;
  }

  removeOunce() {
    this.currentFeeding.ounces--;
  }

  async saveFeeding() {
    this.currentFeeding.time = new Date();
    console.log('saving feeding:', this.currentFeeding);

    await this.storageService.saveFeeding(this.currentFeeding);
    const toast = await this.toastController.create({
      message: 'Feeding added',
      duration: 3000,
      color: 'dark'
    });
    toast.present();

    // this.previousFeeding = this.currentFeeding;
    // re-retrieve previous feeding
    this.previousFeeding = await this.storageService.getPreviousFeeding();
    this.currentFeeding = {
      ounces: 1
    } as Feeding;
  }

  async showSleepHistory() {
    const sleepModal = await this.modalController.create({
      component: SleepHistoryModalComponent,
      swipeToClose: true
    });
    await sleepModal.present();
    await sleepModal.onDidDismiss();
    this.previousSleep = await this.storageService.getPreviousSleep();
  }

  async showFeedingHistory() {
    const feedingModal = await this.modalController.create({
      component: FeedingHistoryModalComponent,
      swipeToClose: true
    });
    await feedingModal.present();
    await feedingModal.onDidDismiss();
    this.previousFeeding = await this.storageService.getPreviousFeeding();
  }

}
