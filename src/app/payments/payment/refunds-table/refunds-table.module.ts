import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { TableModule } from '@vality/matez';
import { ThriftPipesModule } from '@vality/ng-thrift';

import { StatusModule } from '~/shared/components/status';

import { RefundsTableComponent } from './refunds-table.component';

@NgModule({
    imports: [CommonModule, MatButtonModule, StatusModule, ThriftPipesModule, TableModule],
    declarations: [RefundsTableComponent],
    exports: [RefundsTableComponent],
})
export class RefundsTableModule {}
