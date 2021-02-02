import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'sleep',
        loadChildren: () => import('../sleep/sleep.module').then(m => m.SleepPageModule)
      },
      {
        path: 'feed',
        loadChildren: () => import('../feeding/feeding.module').then(m => m.FeedingPageModule)
      },
      {
        path: 'history',
        loadChildren: () => import('../history/history.module').then(m => m.HistoryPageModule)
      },
      {
        path: 'settings',
        loadChildren: () => import('../settings/settings.module').then(m => m.SettingsPageModule)
      },
      {
        path: '',
        redirectTo: '/tabs/sleep',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/sleep',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
