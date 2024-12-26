import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
    FiltersModule,
    DateRangeFieldModule,
    ListFieldModule,
    TableModule,
    DialogModule,
    InputFieldModule,
} from '@vality/matez';

import { PageLayoutModule, ShopFieldModule } from '../../shared';
import { MerchantFieldModule } from '../../shared/components/merchant-field/merchant-field.module';
import { ThriftFormModule } from '../../shared/components/metadata-form/thrift-form.module';
import { MagistaThriftFormComponent } from '../../shared/components/thrift-api-crud';

import { CreatePaymentAdjustmentComponent } from './components/create-payment-adjustment/create-payment-adjustment.component';
import { PaymentsTableComponent } from './components/payments-table/payments-table.component';
import { PaymentsRoutingModule } from './payments-routing.module';
import { PaymentsComponent } from './payments.component';

@NgModule({
    imports: [
        CommonModule,
        PaymentsRoutingModule,
        PageLayoutModule,
        FiltersModule,
        DateRangeFieldModule,
        ListFieldModule,
        MerchantFieldModule,
        ReactiveFormsModule,
        TableModule,
        DialogModule,
        ThriftFormModule,
        MatButtonModule,
        ShopFieldModule,
        InputFieldModule,
        FormsModule,
        MagistaThriftFormComponent,
    ],
    declarations: [PaymentsComponent, CreatePaymentAdjustmentComponent, PaymentsTableComponent],
})
export class PaymentsModule {}
