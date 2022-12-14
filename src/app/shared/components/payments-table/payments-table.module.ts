import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';

import { TableModule } from '../../../../components/table';
import { ApiModelPipesModule, CommonPipesModule } from '../../pipes';
import { StatusModule } from '../status';
import { PaymentActionsPipe } from './payment-actions.pipe';
import { PaymentsTableComponent } from './payments-table.component';

@NgModule({
    imports: [
        CommonModule,
        MatTableModule,
        FlexModule,
        StatusModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        CommonPipesModule,
        ApiModelPipesModule,
        TableModule,
    ],
    declarations: [PaymentsTableComponent, PaymentActionsPipe],
    exports: [PaymentsTableComponent],
})
export class PaymentsTableModule {}
