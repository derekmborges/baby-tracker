import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Feeding, FeedingType } from '../../models/feeding';
import { StorageService } from '../../services/storage.service';
import * as moment from 'moment';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { formatDateString, formatTimeString, isToday, isYesterday } from '../../helpers/date-helpers';
import { FeedingEditModalComponent } from '../feeding-edit-modal/feeding-edit-modal.component';

@Component({
  selector: 'app-feeding-history-modal',
  templateUrl: './feeding-history-modal.component.html',
  styleUrls: ['./feeding-history-modal.component.scss'],
})
export class FeedingHistoryModalComponent implements OnInit {
  feedings: Feeding[];
  groupedFeedings: Map<string, Feeding[]>;

  breastType = FeedingType.Breast;
  bottleType = FeedingType.Bottle;

  constructor(
    public modalController: ModalController,
    public alertController: AlertController,
    public toastController: ToastController,
    private storageService: StorageService
  ) { }

  toTimeString(date: Date): string {
    return formatTimeString(date);
  }

  toDateString(date: Date): string {
    return formatDateString(date);
  }

  get showFeedings(): boolean {
    return this.groupedFeedings && this.groupedFeedings.size > 0;
  }

  async ngOnInit() {
    await this.getAndSortFeedings();
    this.groupFeedings();
  }

  private async getAndSortFeedings() {
    const allFeedings = await this.storageService.getAllFeedings();
    this.feedings = allFeedings.sort((a: Feeding, b: Feeding) => {
      return moment(b.time).diff(moment(a.time));
    });
  }

  private groupFeedings() {
    const groupedFeedings = new Map<string, Feeding[]>();
    this.feedings.forEach(feeding => {
      const key = isToday(feeding.time) ? 'Today'
                : isYesterday(feeding.time) ? 'Yesterday'
                : formatDateString(feeding.time);
      const dayCollection = groupedFeedings.get(key);
      if (!dayCollection) {
        groupedFeedings.set(key, [feeding]);
      } else {
        dayCollection.push(feeding);
      }
    });
    this.groupedFeedings = groupedFeedings;
  }

  dayTotal(day: string): number {
    return this.groupedFeedings.get(day)
      .map(f => f.bottleDetails ? f.bottleDetails.ounces : 0)
      .reduce((previous, current) => previous + current);
  }

  async editFeeding(feeding: Feeding) {
    const modal = await this.modalController.create({
      component: FeedingEditModalComponent,
      componentProps: { feeding }
    });
    await modal.present();
    await modal.onDidDismiss();
    this.ngOnInit();
  }

  async deleteFeeding(feeding: Feeding) {
    const alert = await this.alertController.create({
      header: `Feeding at ${formatTimeString(feeding.time)}`,
      message: 'Are you sure you want to delete this feeding?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        }, {
          text: 'Delete',
          cssClass: 'danger',
          handler: async () => {
            await this.storageService.deleteFeeding(feeding);
            (await this.toastController.create({
              message: 'Feeding deleted',
              duration: 3000,
              color: 'dark'
            })).present();
            this.ngOnInit();
          }
        }
      ]
    });

    await alert.present();
  }

  close() {
    this.modalController.dismiss();
  }

}
