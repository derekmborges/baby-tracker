import { AfterViewInit, Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { ToastController, ModalController, Platform, AnimationController, AlertController } from '@ionic/angular';
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
export class SleepComponent implements AfterViewInit, OnInit {
  @ViewChild('page') pageElement;

  currentSleep: Sleep;
  previousSleep: Sleep;

  timing = false;
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
    public animationController: AnimationController,
    public alertController: AlertController
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
    this.previousSleep = await this.storageService.getPreviousSleep();
    if (this.currentSleep) {
      this.timing = true;
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
        if (this.timing) {
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
    this.timing = true;

    // initialize sleep object
    this.currentSleep = {
      startTime: new Date()
    } as Sleep;

    // store sleep object for persistence
    await this.storageService.saveCurrentSleep(this.currentSleep);

    // start sleep counter
    this.updateSleepCounter();
  }

  endSleep() {
    this.timing = false;

    // set the wake time
    this.currentSleep.endTime = new Date();

    // stop sleep counter
    clearInterval(this.sleepCounterTimer);
    this.sleepCounterTimer = undefined;
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

    this.currentSleep = undefined;
  }

  async resetSleep() {
    const alert = await this.alertController.create({
      header: 'Confirm sleep reset',
      message: 'Are you sure you want to reset this sleep? This cannot be undone',
      buttons: [
        {
          text: 'Yes',
          handler: async () => {
            await this.storageService.deleteSleep(this.currentSleep);
            this.currentSleep = undefined;
            if (this.sleepCounterTimer) {
              clearInterval(this.sleepCounterTimer);
              this.sleepCounterTimer = undefined;
            }
          }
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    });
    await alert.present();
  }

  async resumeSleep() {
    const alert = await this.alertController.create({
      header: 'Continue sleep',
      message: 'Are you sure you want to continue this sleep session?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.timing = true;
            // remove end time
            this.currentSleep.endTime = null;
            // start sleep counter
            this.updateSleepCounter();
          }
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    });
    await alert.present();
  }

}
