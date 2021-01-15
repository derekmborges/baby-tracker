import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, Animation, AnimationController, ModalController, ToastController } from '@ionic/angular';
import { formatTimeString } from 'src/app/helpers/date-helpers';
import { BottleDetails, BreastDetails, Feeding, FeedingType } from 'src/app/models/feeding';
import { StorageService } from 'src/app/services/storage.service';
import { FeedingHistoryModalComponent } from './feeding-history-modal/feeding-history-modal.component';
import * as moment from 'moment';

@Component({
  selector: 'app-feeding',
  templateUrl: './feeding.component.html',
  styleUrls: ['./feeding.component.scss'],
})
export class FeedingComponent implements AfterViewInit,OnInit {
  @ViewChild('page') pageElement;

  feeding: Feeding;
  breastType = FeedingType.Breast;
  bottleType = FeedingType.Bottle;

  previousFeeding: Feeding;

  manual = false;

  timing = undefined;
  feedingCounterTimer: any;
  feedingMinutes: string = '00';
  feedingSeconds: string = '00';

  constructor(
    public toastCtrl: ToastController,
    public modalCtrl: ModalController,
    public animationController: AnimationController,
    public alertController: AlertController,
    private storageService: StorageService
  ) { }

  ngAfterViewInit() {
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
    }, 500);
  }

  ngOnInit() {
    this.feeding = {
      type: this.breastType,
      breastDetails: {
      } as BreastDetails
    } as Feeding;

    this.loadData();
  }

  private async loadData() {
    this.previousFeeding = await this.storageService.getPreviousFeeding();
  }

  get recordedTime(): boolean {
    return this.feeding && this.feeding.type === this.breastType && this.feeding.breastDetails !== undefined
      && (this.feedingMinutes !== '00' || this.feedingSeconds !== '00');
  }

  updateFeedCounter() {
    const newSeconds = Number.parseInt(this.feedingSeconds) + 1;
    this.feedingSeconds = (newSeconds % 60).toString().padStart(2, '0');
    if (newSeconds === 60) {
      this.feedingMinutes = (Number.parseInt(this.feedingMinutes) + 1).toString().padStart(2, '0');
    }

    // Update specific side's counter
    if (this.timing === 'left') {
      const newSeconds = Number.parseInt(this.feeding.breastDetails.leftSeconds) + 1;
      this.feeding.breastDetails.leftSeconds = (newSeconds % 60).toString().padStart(2, '0');
      if (newSeconds === 60) {
        this.feeding.breastDetails.leftMinutes = 
          (Number.parseInt(this.feeding.breastDetails.leftMinutes) + 1)
            .toString().padStart(2, '0');
      }
    } else {
      const newSeconds = Number.parseInt(this.feeding.breastDetails.rightSeconds) + 1;
      this.feeding.breastDetails.rightSeconds = (newSeconds % 60).toString().padStart(2, '0');
      if (newSeconds === 60) {
        this.feeding.breastDetails.rightMinutes = 
          (Number.parseInt(this.feeding.breastDetails.rightMinutes) + 1)
            .toString().padStart(2, '0');
      }
    }

    if (Number.parseInt(this.feedingMinutes) === 120) {
      this.stopTimer(true);
    }
  }

  toTimeString(date: Date): string {
    return formatTimeString(date);
  }

  toggleBreastTimer(side: string) {
    if (!this.timing) {
      this.timing = side;
      this.feeding.breastDetails.lastBreast = side;
      if (side === 'left' && (!this.feeding.breastDetails.leftMinutes || !this.feeding.breastDetails.leftSeconds)) {
        this.feeding.breastDetails.leftMinutes = '00';
        this.feeding.breastDetails.leftSeconds = '00';
      } else if (side === 'right' && (!this.feeding.breastDetails.rightMinutes || !this.feeding.breastDetails.rightSeconds)) {
        this.feeding.breastDetails.rightMinutes = '00';
        this.feeding.breastDetails.rightSeconds = '00';
      }
      this.startTimer();
    } else {
      const timingSide = this.timing;
      this.timing = undefined;
      this.stopTimer();
      if (timingSide !== side) {
        this.toggleBreastTimer(side);
      }
    }
  }

  async startTimer() {
    // set the start time if this is the first timer
    if (!this.feeding.time) {
      this.feeding.time = new Date();
    }
    // store feeding object for persistence
    // await this.storageService.saveCurrentFeeding(this.feeding);

    // start feed counter
    this.feedingCounterTimer = setInterval(() => this.updateFeedCounter(), 1000);
  }

  async stopTimer(maxedTimer = false) {
    clearInterval(this.feedingCounterTimer);
    this.feedingCounterTimer = undefined;

    if (maxedTimer) {
      (await this.alertController.create({
        message: 'Timer maxed out at 120 minutes.',
        buttons: [
          {
            text: 'Ok',
          }
        ]
      })).present();
    }
  }

  manualEntry() {
    this.manual = true;
  }

  timerEntry() {
    this.manual = false;
  }

}
