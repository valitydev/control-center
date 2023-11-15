import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { InputFieldModule } from '@vality/ng-core';

import { ShopsTableComponent } from '../../shared/components/shops-table';

import { PartyShopsRoutingModule } from './party-shops-routing.module';
import { PartyShopsComponent } from './party-shops.component';

@NgModule({
    imports: [
        PartyShopsRoutingModule,
        CommonModule,

        ReactiveFormsModule,
        InputFieldModule,
        ShopsTableComponent,
    ],
    declarations: [PartyShopsComponent],
})
export class PartyShopsModule {}
