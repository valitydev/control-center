import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import {
    TableModule,
    DateRangeFieldModule,
    FiltersModule,
    ListFieldModule,
    InputFieldModule,
    SelectFieldModule,
    DialogModule,
} from '@vality/ng-core';

import { PageLayoutModule, ShopFieldModule, ThriftPipesModule } from '../../shared';
import { MagistaThriftFormComponent } from '../../shared/components/magista-thrift-form';
import { MerchantFieldModule } from '../../shared/components/merchant-field';
import { MetadataFormModule } from '../../shared/components/metadata-form';
import { DomainThriftFormComponent } from '../../shared/components/thrift-forms/domain-thrift-form';

import { ChargebacksRoutingModule } from './chargebacks-routing.module';
import { ChargebacksComponent } from './chargebacks.component';
import { ChargebacksTableComponent } from './components/chargebacks-table/chargebacks-table.component';
import { CreateChargebackDialogComponent } from './components/create-chargeback-dialog/create-chargeback-dialog.component';

@NgModule({
    declarations: [
        ChargebacksComponent,
        ChargebacksTableComponent,
        CreateChargebackDialogComponent,
    ],
    imports: [
        CommonModule,
        ChargebacksRoutingModule,
        PageLayoutModule,
        TableModule,
        DateRangeFieldModule,
        FiltersModule,
        ReactiveFormsModule,
        ListFieldModule,
        MerchantFieldModule,
        ShopFieldModule,
        InputFieldModule,
        MetadataFormModule,
        MagistaThriftFormComponent,
        SelectFieldModule,
        MatFormFieldModule,
        MatOptionModule,
        MatSelectModule,
        ThriftPipesModule,
        MatButtonModule,
        DialogModule,
        DomainThriftFormComponent,
        FlexModule,
    ],
})
export class ChargebacksModule {}
