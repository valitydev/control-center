import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import {
    DialogModule,
    ListFieldModule,
    TableModule,
    FiltersModule,
    NumberRangeFieldModule,
    DateRangeFieldModule,
    InputFieldModule,
} from '@vality/ng-core';

import { PageLayoutModule } from '../../shared';
import { MerchantFieldModule } from '../../shared/components/merchant-field';
import { MetadataFormModule } from '../../shared/components/metadata-form';
import { ThriftPipesModule } from '../../shared/pipes/thrift';

import { CreateAdjustmentDialogComponent } from './components/create-adjustment-dialog/create-adjustment-dialog.component';
import { WithdrawalsRoutingModule } from './withdrawals-routing.module';
import { WithdrawalsComponent } from './withdrawals.component';

@NgModule({
    imports: [
        WithdrawalsRoutingModule,
        CommonModule,
        MatCardModule,
        MatProgressBarModule,
        MatButtonModule,
        MerchantFieldModule,
        ReactiveFormsModule,
        ThriftPipesModule,
        MatCheckboxModule,
        TableModule,
        MatSortModule,
        MetadataFormModule,
        DialogModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatRadioModule,
        PageLayoutModule,
        ListFieldModule,
        FiltersModule,
        NumberRangeFieldModule,
        DateRangeFieldModule,
        InputFieldModule,
        NumberRangeFieldModule,
    ],
    declarations: [WithdrawalsComponent, CreateAdjustmentDialogComponent],
})
export class WithdrawalsModule {}
