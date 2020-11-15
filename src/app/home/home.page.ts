import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AnimationController, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, AfterViewInit {
  @ViewChild('title') titleElement;
  @ViewChild('page') pageElement;

  constructor(
    public modalController: ModalController,
    public animationController: AnimationController,
  ) {}

  ngAfterViewInit(): void {
    // animate title in
    this.animationController.create()
      .addElement(this.titleElement.nativeElement)
      .duration(1000)
      .keyframes([
        { offset: 0, opacity: 0 },
        { offset: 0.5, opacity: 1}
      ])
      .play();

    // animate page in
    this.animationController.create()
      .addElement(this.pageElement.nativeElement)
      .duration(1000)
      .keyframes([
        { offset: 0, opacity: 0 },
        { offset: 0.5, opacity: 0 },
        { offset: 1, opacity: 1}
      ])
      .play();
  }

  ngOnInit() {}

}
