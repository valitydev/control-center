import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

import { StatusModule } from '@cc/app/shared/components/status';
import { CommonPipesModule, ThriftPipesModule, AmountCurrencyPipe } from '@cc/app/shared/pipes';
import { TableModule } from '@cc/components/table';

import { RefundsTableComponent } from './refunds-table.component';

@NgModule({
    imports: [
        CommonModule,
        MatTableModule,
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
