import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { TableModule } from '../../../../../../ng-libs/projects/ng-core/dist';
import { StatusModule } from '../../../shared/components/status';
import { CommonPipesModule, ThriftPipesModule, AmountCurrencyPipe } from '../../../shared/pipes';

import { RefundsTableComponent } from './refunds-table.component';

@NgModule({
    imports: [
        CommonModule,
        MatButtonModule,
        StatusModule,
        ThriftPipesModule,
        CommonPipesModule,
        AmountCurrencyPipe,
        TableModule,
    ],
    declarations: [RefundsTableComponent],
    exports: [RefundsTableComponent],
})
export class RefundsTableModule {}
