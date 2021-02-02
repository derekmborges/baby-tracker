import { AfterViewInit, Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { AlertController, Animation, AnimationController, ModalController, Platform, ToastController } from '@ionic/angular';
import { formatTimeString } from 'src/app/helpers/date-helpers';
import { BottleDetails, BreastDetails, Feeding, FeedingType } from 'src/app/models/feeding';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-feeding',
  templateUrl: './feeding.component.html',
  styleUrls: ['./feeding.component.scss'],
})
export class FeedingComponent implements AfterViewInit, OnInit {
  @ViewChild('page') pageElement;

  feeding: Feeding;
  breastType = FeedingType.Breast;
  bottleType = FeedingType.Bottle;

  previousFeeding: Feeding;

  manual = false;

  timing = undefined;
  feedingCounterTimer: any;
  feedingMinutes: string;
  feedingSeconds: string;

  constructor(
    public platform: Platform,
    public toastCtrl: ToastController,
    public modalCtrl: ModalController,
    public animationController: AnimationController,
    public alertController: AlertController,
    private ngZone: NgZone,
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

  async ngOnInit() {
    this.feeding = await this.storageService.getCurrentFeeding();
    console.log('currentFeeding: ', this.feeding);
    this.previousFeeding = await this.storageService.getPreviousFeeding();
    
    if (this.feeding) {
      this.calculateTimer();
      if (this.feeding.breastDetails.timing) {
        this.timing = this.feeding.breastDetails.timing;
        this.startTimer();
      }
    } else {
      console.info('no current feeding. creating new object...');
      this.feeding = {
        type: this.breastType,
        breastDetails: {} as BreastDetails
      } as Feeding;
      this.feedingMinutes = '00';
      this.feedingSeconds = '00';
    }

    // register pause and resume events
    this.platform.pause.subscribe(() => {
      console.log('app paused');
      this.stopTimer();
    });
    this.platform.resume.subscribe(() => {
      this.ngZone.run(() => {
        console.log('app resumed');
        if (this.timing) {
          this.updateFeedCounter();
          this.startTimer();
        }
      });
    });
  }

  get recordedTime(): boolean {
    return this.feeding && this.feeding.type === this.breastType && this.feeding.breastDetails !== undefined
      && (this.feedingMinutes !== '00' || this.feedingSeconds !== '00');
  }

  calculateTimer() {
    const leftMinutes = Number.parseInt(this.feeding.breastDetails.leftMinutes || '0');
    const leftSeconds = Number.parseInt(this.feeding.breastDetails.leftSeconds || '0');
    const rightMinutes = Number.parseInt(this.feeding.breastDetails.rightMinutes || '0');
    const rightSeconds = Number.parseInt(this.feeding.breastDetails.rightSeconds || '0');
    console.log(`left: ${leftMinutes}:${leftSeconds}, right: ${rightMinutes}:${rightSeconds}`);
    
    let totalMinutes = leftMinutes + rightMinutes;
    let totalSeconds = leftSeconds + rightSeconds;
    // handle if seconds overflow into minutes
    if (totalSeconds >= 60) {
      totalMinutes++;
      totalSeconds -= 60;
    }

    this.feedingMinutes = totalMinutes.toString().padStart(2, '0');
    this.feedingSeconds = totalSeconds.toString().padStart(2, '0');
    console.log(`calculated timer: ${this.feedingMinutes}:${this.feedingSeconds}`);
    
    if (Number.parseInt(this.feedingMinutes) >= 120) {
      this.stopTimer(true);
    }
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

    this.updateCurrentFeeding();
  }

  toTimeString(date: Date): string {
    return formatTimeString(date);
  }

  async toggleBreastTimer(side: string) {
    if (!this.timing) {
      this.timing = side;
      if (side === 'left' && (!this.feeding.breastDetails.leftMinutes || !this.feeding.breastDetails.leftSeconds)) {
        this.feeding.breastDetails.leftMinutes = '00';
        this.feeding.breastDetails.leftSeconds = '00';
      } else if (side === 'right' && (!this.feeding.breastDetails.rightMinutes || !this.feeding.breastDetails.rightSeconds)) {
        this.feeding.breastDetails.rightMinutes = '00';
        this.feeding.breastDetails.rightSeconds = '00';
      }
      this.startTimer();
      this.feeding.breastDetails.timing = this.timing;
    } else {
      this.feeding.breastDetails.lastBreast = this.timing;
      const timingSide = this.timing;
      this.timing = undefined;
      this.stopTimer();
      this.feeding.breastDetails.timing = this.timing;
      if (timingSide !== side) {
        this.toggleBreastTimer(side);
      }
    }

    this.updateCurrentFeeding();
  }

  async startTimer() {
    // set the start time if this is the first timer
    if (!this.feeding.time) {
      this.feeding.time = new Date();
    }
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

  async updateCurrentFeeding() {
    // store current feeding object for persistence
    await this.storageService.saveCurrentFeeding(this.feeding);
  }

  async resetFeeding() {
    (await this.alertController.create({
      header: 'Confirm feed reset',
      message: 'Are you sure you want to reset this feed? This cannot be undone',
      buttons: [
        {
          text: 'Yes',
          handler: async () => {
            this.timing = false;
            await this.storageService.deleteCurrentFeeding();
            this.ngOnInit();
            if (this.feedingCounterTimer) {
              clearInterval(this.feedingCounterTimer);
              this.feedingCounterTimer = undefined;
            }
          }
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    })).present();
  }

  async save() {
    await this.storageService.saveFeeding(this.feeding);
    await this.storageService.deleteCurrentFeeding();
    this.feeding = undefined;

    (await this.toastCtrl.create({
      message: 'Feeding saved',
      duration: 3000
    })).present();

    this.ngOnInit();
  }

  manualEntry() {
    this.manual = true;
  }

  timerEntry() {
    this.manual = false;
  }

}
