import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ShopsTermsComponent } from './components/shops-terms/shops-terms.component';
import { TariffsRoutingModule } from './tariffs-routing.module';

@NgModule({
    imports: [CommonModule, TariffsRoutingModule, ShopsTermsComponent],
})
export class TariffsModule {}
