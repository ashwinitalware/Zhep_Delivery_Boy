import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ShowMapPageRoutingModule } from './show-map-routing.module';

import { ShowMapPage } from './show-map.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShowMapPageRoutingModule
  ],
  declarations: [ShowMapPage]
})
export class ShowMapPageModule {}
