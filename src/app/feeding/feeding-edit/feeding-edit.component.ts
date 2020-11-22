import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ToastController, ModalController, AnimationController, Animation } from '@ionic/angular';
import { BottleDetails, BreastDetails, Feeding, FeedingType } from 'src/app/models/feeding';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-feeding-edit',
  templateUrl: './feeding-edit.component.html',
  styleUrls: ['./feeding-edit.component.scss'],
})
export class FeedingEditComponent implements OnInit, AfterViewInit {
  @Input() feeding: Feeding;
  
  breastType = FeedingType.Breast;
  bottleType = FeedingType.Bottle;

  @ViewChild('feedingDetails') feedingDetails;
  feedingDetailsFadeAnimation: Animation;

  @Output() feedingAdded = new EventEmitter<any>();
  @Output() feedingUpdated = new EventEmitter<any>();

  constructor(
    public toastCtrl: ToastController,
    public modalCtrl: ModalController,
    public animationCtrl: AnimationController,
    private storageService: StorageService
  ) { }

  ngAfterViewInit(): void {
    // animate title in
    this.feedingDetailsFadeAnimation = this.animationCtrl.create()
      .addElement(this.feedingDetails.nativeElement)
      .duration(300)
      .fromTo('opacity', '0', '1');
  }

  ngOnInit() {
    // initialize feeding if it wasn't passed in
    if (!this.feeding) {
      this.feeding = {
        type: FeedingType.Breast,
        breastDetails: { left: false, right: false } as BreastDetails,
        bottleDetails: { ounces: 1} as BottleDetails
      } as Feeding;
    }
  }

  typeChanged(event: any) {
    this.feeding.type = event.detail.value;
    this.feedingDetailsFadeAnimation.play();
    if (this.feeding.type === this.bottleType && !this.feeding.bottleDetails) {
      this.feeding.bottleDetails = { ounces: 1 } as BottleDetails;
    } else if (this.feeding.type === this.breastType && !this.feeding.breastDetails) {
      this.feeding.breastDetails = { left: false, right: false } as BreastDetails;
    }
  }

  toggleLeftBreast() {
    this.feeding.breastDetails.left = !this.feeding.breastDetails.left;
    if (!this.feeding.breastDetails.left) {
      this.feeding.breastDetails.leftRating = null;
    }
  }

  toggleRightBreast() {
    this.feeding.breastDetails.right = !this.feeding.breastDetails.right;
    if (!this.feeding.breastDetails.right) {
      this.feeding.breastDetails.rightRating = null;
    }
  }

  selectLeftFeedback(rating: string) {
    this.feeding.breastDetails.leftRating = rating;
  }

  selectRightFeedback(rating: string) {
    this.feeding.breastDetails.rightRating = rating;
  }

  addOunce() {
    this.feeding.bottleDetails.ounces++;
  }

  removeOunce() {
    this.feeding.bottleDetails.ounces--;
  }

  dateTimeChanged(event: any) {
    this.feeding.time = event.detail.value;
  }

  async save() {
    // clear out the non-selected feeding details
    if (this.feeding.type === this.breastType) {
      this.feeding.bottleDetails = null;
    } else {
      this.feeding.breastDetails = null;
    }

    if (this.feeding.id) {
      console.log('updating feeding:', this.feeding);
      // update feeding
      await this.storageService.updateFeeding(this.feeding);
      (await this.toastCtrl.create({
        message: 'Feeding updated',
        duration: 3000,
        color: 'dark'
      })).present();

      // emit event
      this.feedingUpdated.emit();

    } else {
      console.log('adding feeding:', this.feeding);
      // add feeding
      this.feeding.time = new Date();
      console.log('saving feeding:', this.feeding);
      await this.storageService.saveFeeding(this.feeding);

      // re-initialize feeding
      this.feeding = {
        type: this.feeding.type,
        breastDetails: { left: false, right: false } as BreastDetails,
        bottleDetails: { ounces: 1} as BottleDetails
      } as Feeding;

      // show message
      const toast = await this.toastCtrl.create({
        message: 'Feeding added',
        duration: 3000,
        color: 'dark'
      });
      toast.present();

      // emit event
      this.feedingAdded.emit();
    }

  }

}
