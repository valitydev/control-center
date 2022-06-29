import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule, GridModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';

import { EmptySearchResultModule } from '../../../components/empty-search-result';
import { DateRangeModule } from '../../shared/components/date-range/date-range.module';
import { MerchantFieldModule } from '../../shared/components/merchant-field';
import { WithdrawalsRoutingModule } from './withdrawals-routing.module';
import { WithdrawalsComponent } from './withdrawals.component';

@NgModule({
    imports: [
        WithdrawalsRoutingModule,
        CommonModule,
        FlexModule,
        MatCardModule,
        MatProgressBarModule,
        EmptySearchResultModule,
        MatButtonModule,
        MerchantFieldModule,
        GridModule,
        DateRangeModule,
        ReactiveFormsModule,
        MatTableModule,
    ],
    declarations: [WithdrawalsComponent],
})
export class WithdrawalsModule {}
