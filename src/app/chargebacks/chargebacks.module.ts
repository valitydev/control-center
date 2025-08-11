import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import {
    DateRangeFieldModule,
    DialogModule,
    FileUploadModule,
    FiltersModule,
    InputFieldModule,
    ListFieldModule,
    SelectFieldModule,
    TableModule,
} from '@vality/matez';
import { ThriftFormModule, ThriftPipesModule } from '@vality/ng-thrift';

import { UploadCsvComponent } from '~/components/upload-csv';

import { PageLayoutModule, ShopFieldModule } from '../shared';
import { ChargebacksTableComponent } from '../shared/components/chargebacks-table/chargebacks-table.component';
import { MerchantFieldModule } from '../shared/components/merchant-field';
import {
    DomainThriftFormComponent,
    MagistaThriftFormComponent,
} from '../shared/components/thrift-api-crud';

import { ChargebacksRoutingModule } from './chargebacks-routing.module';
import { ChargebacksComponent } from './chargebacks.component';
import { CreateChargebacksByFileDialogComponent } from './components/create-chargebacks-by-file-dialog/create-chargebacks-by-file-dialog.component';

@NgModule({
    declarations: [ChargebacksComponent, CreateChargebacksByFileDialogComponent],
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
        ThriftFormModule,
        MagistaThriftFormComponent,
        SelectFieldModule,
        MatFormFieldModule,
        MatOptionModule,
        MatSelectModule,
        ThriftPipesModule,
        MatButtonModule,
        DialogModule,
        DomainThriftFormComponent,
        FileUploadModule,
        MatExpansionModule,
        MatInputModule,
        MatCheckboxModule,
        UploadCsvComponent,
        ChargebacksTableComponent,
    ],
})
export class ChargebacksModule {}
