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
    public toastController: ToastController
  ) { }

  ngOnInit() {
    console.log('editing feeding', this.feeding);
  }

  close() {
    this.modalController.dismiss();
  }

  feedingUpdated() {
    console.log('updated');
    this.close();
  }

}
