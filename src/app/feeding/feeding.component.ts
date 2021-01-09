import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Animation, AnimationController, ModalController, ToastController } from '@ionic/angular';
import { formatTimeString } from 'src/app/helpers/date-helpers';
import { BottleDetails, BreastDetails, Feeding, FeedingType } from 'src/app/models/feeding';
import { StorageService } from 'src/app/services/storage.service';
import { FeedingHistoryModalComponent } from './feeding-history-modal/feeding-history-modal.component';

@Component({
  selector: 'app-feeding',
  templateUrl: './feeding.component.html',
  styleUrls: ['./feeding.component.scss'],
})
export class FeedingComponent implements AfterViewInit,OnInit {
  @ViewChild('page') pageElement;

  previousFeeding: Feeding;
  allFeedings: Feeding[];

  constructor(
    public toastCtrl: ToastController,
    public modalCtrl: ModalController,
    public animationController: AnimationController,
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
    }, 1000);
  }

  ngOnInit() {
    this.loadData();
  }

  private async loadData() {
    this.previousFeeding = await this.storageService.getPreviousFeeding();
    this.allFeedings = await this.storageService.getAllFeedings();
  }

  toTimeString(date: Date): string {
    return formatTimeString(date);
  }

  feedingAdded(feeding: Feeding) {
    // re-load component
    this.ngOnInit();
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
