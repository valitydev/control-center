import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActionsModule, BaseDialogModule } from '@vality/ng-core';

import { StatusModule, MetadataFormModule } from '@cc/app/shared/components';
import { DetailsItemModule } from '@cc/components/details-item';
import { HeadlineModule } from '@cc/components/headline';

import { ChargebacksComponent } from '../../shared/components/chargebacks/chargebacks.component';
import { CreateChargebackDialogComponent } from './create-chargeback-dialog/create-chargeback-dialog.component';
import { PaymentDetailsRoutingModule } from './payment-details-routing.module';
import { PaymentDetailsComponent } from './payment-details.component';
import { PaymentMainInfoModule } from './payment-main-info';
import { PaymentToolModule } from './payment-main-info/payment-tool';
import { PaymentRefundsModule } from './payment-refunds';

@NgModule({
    imports: [
        CommonModule,
        HeadlineModule,
        FlexLayoutModule,
        PaymentDetailsRoutingModule,
        MatCardModule,
        DetailsItemModule,
        StatusModule,
        PaymentToolModule,
        MatProgressSpinnerModule,
        PaymentMainInfoModule,
        MatButtonModule,
        MatDialogModule,
        PaymentRefundsModule,
        ChargebacksComponent,
        ActionsModule,
        BaseDialogModule,
        MetadataFormModule,
        ReactiveFormsModule,
    ],
    declarations: [PaymentDetailsComponent, CreateChargebackDialogComponent],
})
export class PaymentDetailsModule {}
