import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { IntroGuard } from './guards/intro.guard';
import { HomePage } from './home/home.page';
import { IntroComponent } from './intro/intro.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  {
    path: 'home',
    component: HomePage,
    canActivate: [IntroGuard]
  },
  {
    path: 'intro',
    component: IntroComponent
  },
  {
    path: 'settings',
    component: SettingsComponent
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
