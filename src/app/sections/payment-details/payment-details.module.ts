import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterOutlet } from '@angular/router';
import { ActionsModule, DialogModule } from '@vality/matez';
import { ThriftFormModule, ThriftViewerModule } from '@vality/ng-thrift';

import { HeadlineModule } from '../../../components/headline/headline.module';
import { PageLayoutModule, StatusModule, SubPageLayoutComponent } from '../../shared/components';
import { MagistaThriftViewerComponent } from '../../shared/components/thrift-api-crud';

import { CreateChargebackDialogComponent } from './create-chargeback-dialog/create-chargeback-dialog.component';
import { PaymentDetailsRoutingModule } from './payment-details-routing.module';
import { PaymentDetailsComponent } from './payment-details.component';
import { RefundsTableModule } from './refunds-table';

@NgModule({
    imports: [
        CommonModule,
        HeadlineModule,
        PaymentDetailsRoutingModule,
        MatCardModule,
        StatusModule,
        MatProgressSpinnerModule,
        MatButtonModule,
        MatDialogModule,
        ActionsModule,
        DialogModule,
        ThriftFormModule,
        ReactiveFormsModule,
        PageLayoutModule,
        ThriftViewerModule,
        RefundsTableModule,
        MagistaThriftViewerComponent,
        SubPageLayoutComponent,
        RouterOutlet,
    ],
    declarations: [PaymentDetailsComponent, CreateChargebackDialogComponent],
})
export class PaymentDetailsModule {}
