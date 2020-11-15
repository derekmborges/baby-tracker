import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { formatTimeString } from 'src/app/helpers/date-helpers';
import { Feeding } from 'src/app/models/feeding';
import { StorageService } from 'src/app/services/storage.service';
import { FeedingHistoryModalComponent } from '../feeding-history-modal/feeding-history-modal.component';

@Component({
  selector: 'app-feeding-tracker',
  templateUrl: './feeding-tracker.component.html',
  styleUrls: ['./feeding-tracker.component.scss'],
})
export class FeedingTrackerComponent implements OnInit {
  currentFeeding: Feeding;
  previousFeeding: Feeding;
  allFeedings: Feeding[];

  constructor(
    public toastCtrl: ToastController,
    public modalCtrl: ModalController,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.loadData();

    // initialize feeding
    this.currentFeeding = {
      ounces: 1,
    } as Feeding;
  }

  private async loadData() {
    this.previousFeeding = await this.storageService.getPreviousFeeding();
    this.allFeedings = await this.storageService.getAllFeedings();
  }

  toTimeString(date: Date): string {
    return formatTimeString(date);
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
