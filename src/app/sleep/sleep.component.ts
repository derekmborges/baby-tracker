import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { ToastController, ModalController, Platform, AnimationController } from '@ionic/angular';
import { formatTimeString } from 'src/app/helpers/date-helpers';
import { Sleep } from 'src/app/models/sleep';
import { StorageService } from 'src/app/services/storage.service';
import * as moment from 'moment';
import { SleepHistoryModalComponent } from './sleep-history-modal/sleep-history-modal.component';

@Component({
  selector: 'app-sleep-page',
  templateUrl: './sleep.component.html',
  styleUrls: ['./sleep.component.scss'],
})
export class SleepComponent implements OnInit {
  @ViewChild('page') pageElement;
  
  currentSleep: Sleep;
  // previousSleep: Sleep;
  // allSleep: Sleep[];

  sleeping = false;

  sleepCounterTimer: any;
  sleepHours: string;
  sleepMinutes: string;
  sleepSeconds: string;

  constructor(
    public platform: Platform,
    public toastController: ToastController,
    public modalController: ModalController,
    private ngZone: NgZone,
    private storageService: StorageService,
    public animationController: AnimationController
  ) { }

  get isAwake(): boolean {
    return this.currentSleep === undefined
        || this.currentSleep === null;
  }
  ngAfterViewInit(): void {
    // animate title in
    this.animationController.create()
      .addElement(document.getElementById('title'))
      .duration(2000)
      .fromTo('opacity', '0', '1')
      .play();
    setTimeout(() => {
      this.animationController.create()
      .addElement(this.pageElement.nativeElement)
      .duration(500)
      .fromTo('opacity', '0', '1')
      .play();
    }, 1000);
  }

  async ngOnInit() {
    this.currentSleep = await this.storageService.getCurrentSleep();
    console.log(this.currentSleep);
    // this.previousSleep = await this.storageService.getPreviousSleep();
    // this.allSleep = await this.storageService.getAllSleep();
    if (this.currentSleep) {
      this.sleeping = true;
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
        if (this.sleeping) {
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
    const sleepTimeMoment = moment(this.currentSleep.startTime);
    const duration = moment.duration(currentTimeMoment.diff(sleepTimeMoment));
    this.sleepHours = duration.hours().toString().padStart(2, '0');
    this.sleepMinutes = duration.minutes().toString().padStart(2, '0');
    this.sleepSeconds = duration.seconds().toString().padStart(2, '0');

    // repeatedly update counter
    if (!this.sleepCounterTimer) {
      this.sleepCounterTimer = setInterval(() => this.updateSleepCounter(), 1000);
    }
  }

  async startSleep() {
    this.sleeping = true;

    // initialize sleep object
    this.currentSleep = {
      startTime: new Date()
    } as Sleep;

    // store sleep object for persistence
    await this.storageService.saveCurrentSleep(this.currentSleep);

    // let user know the sleep has been stored
    // const toast = await this.toastController.create({
    //   message: 'Sleep started',
    //   duration: 3000,
    //   color: 'dark'
    // });
    // toast.present();

    // start sleep counter
    this.updateSleepCounter();
  }

  endSleep() {
    this.sleeping = false;

    // set the wake time
    this.currentSleep.endTime = new Date();

    // stop sleep counter
    clearInterval(this.sleepCounterTimer);
  }

  async saveSleep() {
    // store the completed sleep
    await this.storageService.saveCompleteSleep(this.currentSleep);

    // let user know the completed sleep is saved
    const toast = await this.toastController.create({
      message: 'Sleep saved',
      duration: 3000
    });
    toast.present();
  }

  // async showSleepHistory() {
  //   const sleepModal = await this.modalController.create({
  //     component: SleepHistoryModalComponent,
  //     swipeToClose: true
  //   });
  //   await sleepModal.present();
  //   await sleepModal.onDidDismiss();
  //   this.ngOnInit();
  // }

}
