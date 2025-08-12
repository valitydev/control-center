import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import {
    DateRangeFieldModule,
    DialogModule,
    FiltersModule,
    InputFieldModule,
    ListFieldModule,
    TableModule,
} from '@vality/matez';
import { ThriftFormModule } from '@vality/ng-thrift';

import { MerchantFieldModule } from '~/components/merchant-field/merchant-field.module';
import { PageLayoutModule } from '~/components/page-layout';
import { ShopFieldModule } from '~/components/shop-field';
import { MagistaThriftFormComponent } from '~/components/thrift-api-crud';

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
