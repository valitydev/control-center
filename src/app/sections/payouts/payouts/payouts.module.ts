import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import {
    DialogModule,
    ActionsModule,
    DateRangeFieldModule,
    TableModule,
    FiltersModule,
    EnumKeysPipe,
} from '@vality/ng-core';

import {
    PayoutToolFieldModule,
    ShopFieldModule,
    StatusModule,
    PageLayoutModule,
} from '@cc/app/shared/components';
import { MerchantFieldModule } from '@cc/app/shared/components/merchant-field';
import { CommonPipesModule, ThriftPipesModule } from '@cc/app/shared/pipes';

import { CancelPayoutDialogComponent } from './components/cancel-payout-dialog/cancel-payout-dialog.component';
import { CreatePayoutDialogComponent } from './components/create-payout-dialog/create-payout-dialog.component';
import { PayoutsRoutingModule } from './payouts-routing.module';
import { PayoutsComponent } from './payouts.component';

@NgModule({
    declarations: [PayoutsComponent, CreatePayoutDialogComponent, CancelPayoutDialogComponent],
    imports: [
        CommonModule,
        PayoutsRoutingModule,
        MatButtonModule,
        MatCardModule,
        MatProgressBarModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MerchantFieldModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatDatepickerModule,
        MatIconModule,
        MatMenuModule,
        CommonPipesModule,
        ThriftPipesModule,
        StatusModule,
        MatDialogModule,
        ShopFieldModule,
        PayoutToolFieldModule,
        DialogModule,
        ActionsModule,
        PageLayoutModule,
        DateRangeFieldModule,
        TableModule,
        FiltersModule,
        EnumKeysPipe,
    ],
})
export class PayoutsModule {}
