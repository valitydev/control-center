import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatSelectModule } from '@angular/material/select';
import { BaseDialogModule, ActionsModule } from '@vality/ng-core';

import { PayoutToolFieldModule, ShopFieldModule, StatusModule } from '@cc/app/shared/components';
import { MerchantFieldModule } from '@cc/app/shared/components/merchant-field';
import { ApiModelPipesModule, CommonPipesModule, ThriftPipesModule } from '@cc/app/shared/pipes';
import { EmptySearchResultModule } from '@cc/components/empty-search-result';

import { DateRangeModule } from '../../../shared/components/date-range/date-range.module';
import { CancelPayoutDialogComponent } from './components/cancel-payout-dialog/cancel-payout-dialog.component';
import { CreatePayoutDialogComponent } from './components/create-payout-dialog/create-payout-dialog.component';
import { PayoutsSearchFormComponent } from './components/payouts-search-form/payouts-search-form.component';
import { PayoutsTableComponent } from './components/payouts-table/payouts-table.component';
import { PayoutsRoutingModule } from './payouts-routing.module';
import { PayoutsComponent } from './payouts.component';

@NgModule({
    declarations: [
        PayoutsComponent,
        PayoutsTableComponent,
        PayoutsSearchFormComponent,
        CreatePayoutDialogComponent,
        CancelPayoutDialogComponent,
    ],
    imports: [
        CommonModule,
        PayoutsRoutingModule,
        MatButtonModule,
        MatCardModule,
        MatProgressBarModule,
        EmptySearchResultModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MerchantFieldModule,
        FlexLayoutModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatDatepickerModule,
        MatIconModule,
        MatTableModule,
        MatMenuModule,
        ApiModelPipesModule,
        CommonPipesModule,
        ThriftPipesModule,
        StatusModule,
        MatDialogModule,
        ShopFieldModule,
        PayoutToolFieldModule,
        BaseDialogModule,
        ActionsModule,
        DateRangeModule,
    ],
})
export class PayoutsModule {}
