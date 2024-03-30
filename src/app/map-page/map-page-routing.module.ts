import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MapPagePage } from './map-page.page';

const routes: Routes = [
  {
    path: '',
    component: MapPagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MapPagePageRoutingModule {}
