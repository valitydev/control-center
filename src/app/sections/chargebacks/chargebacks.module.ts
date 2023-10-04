import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
    TableModule,
    DateRangeFieldModule,
    FiltersModule,
    ListFieldModule,
    InputFieldModule,
    SelectFieldModule,
    DialogModule,
    FileUploadModule,
} from '@vality/ng-core';

import { MagistaThriftFormComponent } from '@cc/app/shared/components/thrift-api-crud';

import { PageLayoutModule, ShopFieldModule, ThriftPipesModule } from '../../shared';
import { MerchantFieldModule } from '../../shared/components/merchant-field';
import { MetadataFormModule } from '../../shared/components/metadata-form';
import { DomainThriftFormComponent } from '../../shared/components/thrift-api-crud/domain/domain-thrift-form';

import { ChargebacksRoutingModule } from './chargebacks-routing.module';
import { ChargebacksComponent } from './chargebacks.component';
import { ChargebacksTableComponent } from './components/chargebacks-table/chargebacks-table.component';
import { CreateChargebackDialogComponent } from './components/create-chargeback-dialog/create-chargeback-dialog.component';
import { CreateChargebacksByFileDialogComponent } from './components/create-chargebacks-by-file-dialog/create-chargebacks-by-file-dialog.component';

@NgModule({
    declarations: [
        ChargebacksComponent,
        ChargebacksTableComponent,
        CreateChargebackDialogComponent,
        CreateChargebacksByFileDialogComponent,
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
        FileUploadModule,
        MatExpansionModule,
        MatInputModule,
        MatCheckboxModule,
    ],
})
export class ChargebacksModule {}
