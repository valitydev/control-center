import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TableModule, DateRangeFieldModule, FiltersModule } from '@vality/ng-core';

import { PageLayoutModule } from '../../shared';

import { ChargebacksRoutingModule } from './chargebacks-routing.module';
import { ChargebacksComponent } from './chargebacks.component';
import { ChargebacksTableComponent } from './components/chargebacks-table/chargebacks-table.component';

@NgModule({
    declarations: [ChargebacksComponent, ChargebacksTableComponent],
    imports: [
        CommonModule,
        ChargebacksRoutingModule,
        PageLayoutModule,
        TableModule,
        DateRangeFieldModule,
        FiltersModule,
        ReactiveFormsModule,
    ],
})
export class ChargebacksModule {}
