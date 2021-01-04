import { Component, ElementRef, NgZone, OnInit, Renderer2, ViewChild } from '@angular/core';
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
  previousSleep: Sleep;
  allSleep: Sleep[];

  // sleepCounter: string;
  sleepCounterTimer: any;
  sleepHours: string;
  sleepMinutes: string;
  sleepSeconds: string;

  rotateTimer: any;
  timerCircle1Rot = 0;
  timerCircle2Rot = 360;
  @ViewChild('timerCircle1') timerCircle1: ElementRef;
  @ViewChild('timerCircle2') timerCircle2: ElementRef;
  
  breatheTimer: any;
  timerStopCircleWidth = 7.0;
  timerStopCircleDelta = 0.1;
  timerStopCircleMin = 7.0;
  timerStopCircleMax = 9.0;
  @ViewChild('timerStopCircle') timerStopCircle: ElementRef;

  constructor(
    public platform: Platform,
    public toastController: ToastController,
    public modalController: ModalController,
    private ngZone: NgZone,
    private storageService: StorageService,
    public animationController: AnimationController,
    private renderer: Renderer2
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

  rotateTimerCircles() {
    this.renderer.setStyle(this.timerCircle1.nativeElement, 'transform', `rotate(${this.timerCircle1Rot}deg`);
    this.renderer.setStyle(this.timerCircle2.nativeElement, 'transform', `rotate(${this.timerCircle2Rot}deg`);
    this.timerCircle1Rot += 0.1;
    this.timerCircle1Rot = this.timerCircle1Rot % 360;
    this.timerCircle2Rot -= 0.3;
    if (this.timerCircle2Rot < -1) {
      this.timerCircle2Rot = 359;
    }
  }

  breatheTimerCircle() {
    this.renderer.setStyle(this.timerStopCircle.nativeElement, 'width', `${this.timerStopCircleWidth}rem`);
    this.renderer.setStyle(this.timerStopCircle.nativeElement, 'height', `${this.timerStopCircleWidth}rem`);
    this.timerStopCircleWidth += this.timerStopCircleDelta;
    if (this.timerStopCircleWidth >= this.timerStopCircleMax) {
      this.timerStopCircleDelta = -0.01;
    } else if (this.timerStopCircleWidth <= this.timerStopCircleMin) {
      this.timerStopCircleDelta = 0.01;
    }
  }

  async ngOnInit() {
    this.currentSleep = await this.storageService.getCurrentSleep();
    this.previousSleep = await this.storageService.getPreviousSleep();
    this.allSleep = await this.storageService.getAllSleep();
    if (this.currentSleep) {
      this.updateSleepCounter();
      this.breatheTimer = setInterval(() => this.breatheTimerCircle(), 50);
    } else {
      this.rotateTimer = setInterval(() => this.rotateTimerCircles(), 50);
    }

    // register pause and resume events
    this.platform.pause.subscribe(() => {
      console.log('app paused');
      clearInterval(this.sleepCounterTimer);
      clearInterval(this.rotateTimer);
      clearInterval(this.breatheTimer);
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
    this.sleepHours = duration.hours().toString().padStart(2, '0');
    this.sleepMinutes = duration.minutes().toString().padStart(2, '0');
    this.sleepSeconds = duration.seconds().toString().padStart(2, '0');

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
    clearInterval(this.rotateTimer);

    this.animationController.create()
      .addElement(document.getElementById('wallpaper'))
      .duration(500)
      .fromTo('height', '20%', '0%')
      .play();

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

    this.breatheTimer = setInterval(() => this.breatheTimerCircle(), 50);
  }

  async endSleep() {
    clearInterval(this.breatheTimer);
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
    this.rotateTimer = setInterval(() => this.rotateTimerCircles(), 50);
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
