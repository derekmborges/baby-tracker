import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AnimationController, ModalController } from '@ionic/angular';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, AfterViewInit {
  babyName: string;

  @ViewChild('title') titleElement;
  @ViewChild('page') pageElement;

  constructor(
    public modalController: ModalController,
    public animationController: AnimationController,
    private storageService: StorageService
  ) {}

  ngAfterViewInit(): void {
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

  async ngOnInit() {
    this.babyName = await this.storageService.getBabyName();
  }

}
