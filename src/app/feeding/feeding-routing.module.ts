import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeedingComponent } from './feeding.component';

const routes: Routes = [
    {
        path: '',
        component: FeedingComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FeedingPageRoutingModule {}
