import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { Sleep } from 'src/app/models/sleep';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-sleep-edit-modal',
  templateUrl: './sleep-edit-modal.component.html',
  styleUrls: ['./sleep-edit-modal.component.scss'],
})
export class SleepEditModalComponent implements OnInit {
  @Input() sleep: Sleep;

  constructor(
    public modalController: ModalController,
    public toastController: ToastController,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    console.log('editing sleep:', this.sleep);
  }

  sleepChanged(event: any) {
    this.sleep.startTime = event.detail.value;
  }

  wakeChanged(event: any) {
    this.sleep.endTime = event.detail.value;
  }

  close() {
    this.modalController.dismiss();
  }

  async save() {
    await this.storageService.updateSleep(this.sleep);
    (await this.toastController.create({
      message: 'Sleep updated',
      duration: 3000,
      color: 'dark'
    })).present();
    this.close();
  }

}
