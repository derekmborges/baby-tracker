import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { Feeding } from 'src/app/models/feeding';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-feeding-edit-modal',
  templateUrl: './feeding-edit-modal.component.html',
  styleUrls: ['./feeding-edit-modal.component.scss'],
})
export class FeedingEditModalComponent implements OnInit {
  @Input() feeding: Feeding;

  constructor(
    public modalController: ModalController,
    public toastController: ToastController,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    console.log('editing feeding', this.feeding);
  }

  ouncesChanged(event: any) {
    this.feeding.bottleDetails.ounces = event.detail.value;
  }

  dateTimeChanged(event: any) {
    this.feeding.time = event.detail.value;
  }

  close() {
    this.modalController.dismiss();
  }

  async save() {
    await this.storageService.updateFeeding(this.feeding);
    (await this.toastController.create({
      message: 'Feeding updated',
      duration: 3000,
      color: 'dark'
    })).present();
    this.close();
  }

}
