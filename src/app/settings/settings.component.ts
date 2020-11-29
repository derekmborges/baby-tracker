import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, AnimationController, ToastController } from '@ionic/angular';
import { StorageService } from '../services/storage.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, AfterViewInit {
  @ViewChild('settingsPage') pageElement;

  babyName: string;

  themes = ['primary', 'secondary', 'tertiary', 'success', 'warning', 'danger'];
  userTheme: string;

  constructor(
    public animationController: AnimationController,
    public alertController: AlertController,
    public toastController: ToastController,
    private router: Router,
    private storageService: StorageService,
    private theme: ThemeService
  ) { }

  ngAfterViewInit(): void {
    // animate title in
    this.animationController.create()
      .addElement(document.getElementById('settingsTitle'))
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
    this.userTheme = await this.storageService.getUserTheme();
  }

  nameChanged(event: any) {
    this.babyName = event.detail.value;
  }

  selectTheme(theme: string) {
    this.userTheme = theme;
  }

  async close() {
    const existingName = await this.storageService.getBabyName();
    const existingTheme = await this.storageService.getUserTheme();
    if (this.babyName !== existingName || this.userTheme !== existingTheme) {
      (await this.alertController.create({
        header: `Unsaved changes`,
        message: 'Are you sure? All changes will be lost.',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          }, {
            text: 'Confirm',
            cssClass: 'primary',
            handler: () => {
              this.router.navigateByUrl('/');
            }
          }
        ]
      })).present();
    } else {
      this.router.navigateByUrl('/');
    }
  }

  async save() {
    await this.storageService.saveSettings(this.babyName, this.userTheme);
    (await this.toastController.create({
      message: 'Settings updated',
      color: this.userTheme,
      duration: 4000
    })).present();
    this.theme.applyCurrentTheme();
    this.router.navigateByUrl('/');
  }

}
