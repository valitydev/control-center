import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ShopsTariffsComponent } from './components/shops-tariffs/shops-tariffs.component';
import { TariffsRoutingModule } from './tariffs-routing.module';

@NgModule({
    imports: [CommonModule, TariffsRoutingModule, ShopsTariffsComponent],
})
export class TariffsModule {}
