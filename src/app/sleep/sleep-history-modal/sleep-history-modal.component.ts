import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { Sleep } from '../../models/sleep';
import { StorageService } from '../../services/storage.service';
import * as moment from 'moment';
import { isThisWeek, isToday, isYesterday } from '../../helpers/date-helpers';
import { SleepEditModalComponent } from '../sleep-edit-modal/sleep-edit-modal.component';

@Component({
  selector: 'app-sleep-history-modal',
  templateUrl: './sleep-history-modal.component.html',
  styleUrls: ['./sleep-history-modal.component.scss'],
})
export class SleepHistoryModalComponent implements OnInit {
  allSleep: Sleep[];
  groupedSleep: Map<string, Sleep[]>;

  constructor(
    public modalController: ModalController,
    public alertController: AlertController,
    public toastController: ToastController,
    private storageService: StorageService
  ) { }

  get showSleep(): boolean {
    return this.groupedSleep && this.groupedSleep.size > 0;
  }

  async ngOnInit() {
    await this.getAndSortSleep();
    this.groupSleep();
  }

  private async getAndSortSleep() {
    const allSleep = await this.storageService.getAllSleep();
    this.allSleep = allSleep.sort((a: Sleep, b: Sleep) => {
      return moment(b.sleepTime).diff(moment(a.sleepTime));
    });
  }

  private groupSleep() {
    const groupedSleep = new Map<string, Sleep[]>();
    this.allSleep.forEach(sleep => {
      const key = isToday(sleep.sleepTime) ? 'Today'
                : isYesterday(sleep.sleepTime) ? 'Yesterday'
                : this.isWithinWeek(sleep.sleepTime) ? moment(sleep.sleepTime).format('dddd')
                : this.formatDateString(sleep.sleepTime);
      console.log(`${this.formatDateString(sleep.sleepTime)} = ${key}`);
      const dayCollection = groupedSleep.get(key);
      if (!dayCollection) {
        groupedSleep.set(key, [sleep]);
      } else {
        dayCollection.push(sleep);
      }
    });
    this.groupedSleep = groupedSleep;
  }

  private isWithinWeek(date: Date): boolean {
    const sevenDaysAgo = moment().subtract(7, 'days');
    console.log(`${this.formatDateString(date)} within week: ${moment.duration(sevenDaysAgo.diff(moment(date))).days()}`);
    return moment.duration(sevenDaysAgo.diff(moment(date))).days() <= 7;
  }

  formatTimeString(date: Date): string {
    return moment(date).format('h:mm A');
  }

  formatDateString(date: Date): string {
    return moment(date).format('MM/D/YYYY');
  }

  sleepDuration(sleep: Sleep): string {
    const duration = moment.duration(moment(sleep.wakeTime).diff(moment(sleep.sleepTime)));
    let durationString = '';
    durationString += duration.hours() > 0 ? duration.hours + 'hr ' : '';
    durationString += duration.minutes() > 0 ? duration.minutes() + 'min ' : '';
    durationString += duration.seconds() > 0 ? duration.seconds() + 'sec' : '';
    return durationString;
  }

  async editSleep(sleep: Sleep) {
    const modal = await this.modalController.create({
      component: SleepEditModalComponent,
      componentProps: { sleep }
    });
    await modal.present();
    await modal.onDidDismiss();
    this.ngOnInit();
  }

  async deleteSleep(sleep: Sleep) {
    const alert = await this.alertController.create({
      header: `Sleep: ${this.formatTimeString(sleep.sleepTime)} - ${this.formatTimeString(sleep.wakeTime)}`,
      message: 'Are you sure you want to delete this sleep?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Delete',
          cssClass: 'danger',
          handler: async () => {
            await this.storageService.deleteSleep(sleep);
            (await this.toastController.create({
              message: 'Sleep deleted',
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
