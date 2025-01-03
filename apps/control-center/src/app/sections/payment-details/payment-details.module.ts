import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterOutlet } from '@angular/router';
import { ActionsModule, DialogModule } from '@vality/matez';

import { DetailsItemModule } from '../../../components/details-item/details-item.module';
import { HeadlineModule } from '../../../components/headline/headline.module';
import { StatusModule, PageLayoutModule, SubPageLayoutComponent } from '../../shared/components';
import { JsonViewerModule } from '../../shared/components/json-viewer';
import { ThriftFormModule } from '../../shared/components/metadata-form';
import { MagistaThriftViewerComponent } from '../../shared/components/thrift-api-crud';
import { ThriftViewerModule } from '../../shared/components/thrift-viewer';

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
        DetailsItemModule,
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
        JsonViewerModule,
        RefundsTableModule,
        MagistaThriftViewerComponent,
        SubPageLayoutComponent,
        RouterOutlet,
    ],
    declarations: [PaymentDetailsComponent, CreateChargebackDialogComponent],
})
export class PaymentDetailsModule {}
