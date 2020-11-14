import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Feeding } from 'src/app/models/feeding';

@Component({
  selector: 'app-feeding-edit-modal',
  templateUrl: './feeding-edit-modal.component.html',
  styleUrls: ['./feeding-edit-modal.component.scss'],
})
export class FeedingEditModalComponent implements OnInit {
  @Input() feeding: Feeding;

  constructor(
    public modalController: ModalController
  ) { }

  ngOnInit() {
    console.log(this.feeding);
  }

  close() {
    this.modalController.dismiss();
  }

}
