import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ShowMapPage } from './show-map.page';

const routes: Routes = [
  {
    path: '',
    component: ShowMapPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShowMapPageRoutingModule {}
