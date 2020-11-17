import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Animation, AnimationController, ModalController, ToastController } from '@ionic/angular';
import { formatTimeString } from 'src/app/helpers/date-helpers';
import { BottleDetails, BreastDetails, Feeding, FeedingType } from 'src/app/models/feeding';
import { StorageService } from 'src/app/services/storage.service';
import { FeedingHistoryModalComponent } from '../feeding-history-modal/feeding-history-modal.component';

@Component({
  selector: 'app-feeding-tracker',
  templateUrl: './feeding-tracker.component.html',
  styleUrls: ['./feeding-tracker.component.scss'],
})
export class FeedingTrackerComponent implements OnInit, AfterViewInit {
  currentFeeding: Feeding;
  previousFeeding: Feeding;
  allFeedings: Feeding[];

  breastType = FeedingType.Breast;
  bottleType = FeedingType.Bottle;

  @ViewChild('feedingDetails') feedingDetails;
  feedingDetailsFadeAnimation: Animation;

  constructor(
    public toastCtrl: ToastController,
    public modalCtrl: ModalController,
    public animationController: AnimationController,
    private storageService: StorageService
  ) { }

  ngAfterViewInit(): void {
    // animate title in
    this.feedingDetailsFadeAnimation = this.animationController.create()
      .addElement(this.feedingDetails.nativeElement)
      .duration(300)
      .fromTo('opacity', '0', '1');
  }

  ngOnInit() {
    this.loadData();

    // initialize feeding
    this.currentFeeding = {
      type: FeedingType.Breast,
      breastDetails: { left: false, right: false } as BreastDetails
    } as Feeding;
  }

  private async loadData() {
    this.previousFeeding = await this.storageService.getPreviousFeeding();
    this.allFeedings = await this.storageService.getAllFeedings();
  }

  toTimeString(date: Date): string {
    return formatTimeString(date);
  }

  typeChanged(event: any) {
    this.currentFeeding.type = event.detail.value;
    this.feedingDetailsFadeAnimation.play();
    if (this.currentFeeding.type === this.bottleType) {
      this.currentFeeding.bottleDetails = { ounces: 1 } as BottleDetails;
      this.currentFeeding.breastDetails = null;
    } else {
      this.currentFeeding.breastDetails = { left: false, right: false } as BreastDetails;
      this.currentFeeding.bottleDetails = null;
    }
  }

  toggleLeftBreast() {
    this.currentFeeding.breastDetails.left = !this.currentFeeding.breastDetails.left;
    if (!this.currentFeeding.breastDetails.left) {
      this.currentFeeding.breastDetails.leftRating = null;
    }
  }

  toggleRightBreast() {
    this.currentFeeding.breastDetails.right = !this.currentFeeding.breastDetails.right;
    if (!this.currentFeeding.breastDetails.right) {
      this.currentFeeding.breastDetails.rightRating = null;
    }
  }

  selectLeftFeedback(rating: string) {
    this.currentFeeding.breastDetails.leftRating = rating;
  }

  selectRightFeedback(rating: string) {
    this.currentFeeding.breastDetails.rightRating = rating;
  }

  addOunce() {
    this.currentFeeding.bottleDetails.ounces++;
  }

  removeOunce() {
    this.currentFeeding.bottleDetails.ounces--;
  }

  async saveFeeding() {
    this.currentFeeding.time = new Date();
    console.log('saving feeding:', this.currentFeeding);

    await this.storageService.saveFeeding(this.currentFeeding);
    const toast = await this.toastCtrl.create({
      message: 'Feeding added',
      duration: 3000,
      color: 'dark'
    });
    toast.present();

    // re-init component
    this.ngOnInit()
  }

  async showFeedingHistory() {
    const feedingModal = await this.modalCtrl.create({
      component: FeedingHistoryModalComponent,
      swipeToClose: true
    });
    await feedingModal.present();
    await feedingModal.onDidDismiss();
    this.ngOnInit();
  }

}
