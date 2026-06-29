import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { InputFieldModule } from '@vality/matez';

import { PageLayoutModule } from '~/components/page-layout';
import { ShopsTableComponent } from '~/components/shops-table';

import { PartyShopsRoutingModule } from './shops-routing.module';
import { PartyShopsComponent } from './shops.component';

@NgModule({
    imports: [
        PartyShopsRoutingModule,
        CommonModule,
        ReactiveFormsModule,
        InputFieldModule,
        ShopsTableComponent,
        PageLayoutModule,
        MatButtonModule,
    ],
    declarations: [PartyShopsComponent],
})
export class PartyShopsModule {}
