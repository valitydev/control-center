import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ShopsTermsComponent } from './components/shops-terms/shops-terms.component';
import { TermsRoutingModule } from './terms-routing.module';

@NgModule({
    imports: [CommonModule, TermsRoutingModule, ShopsTermsComponent],
})
export class Terms {}
