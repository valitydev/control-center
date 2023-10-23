import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PageLayoutModule } from '../../shared';

import { ShopsRoutingModule } from './shops-routing.module';
import { ShopsComponent } from './shops.component';

@NgModule({
    declarations: [ShopsComponent],
    imports: [CommonModule, ShopsRoutingModule, PageLayoutModule],
})
export class ShopsModule {}
