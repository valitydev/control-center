import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { StatusModule } from '@cc/app/shared/components';
import { DetailsItemModule } from '@cc/components/details-item';
import { HeadlineModule } from '@cc/components/headline';

import { DepositDetailsRoutingModule } from './deposit-details-routing.module';
import { DepositDetailsComponent } from './deposit-details.component';
import { DepositMainInfoModule } from './deposit-main-info/deposit-main-info.module';
import { RevertsModule } from './reverts/reverts.module';

@NgModule({
    imports: [
        CommonModule,
        HeadlineModule,
        FlexLayoutModule,
        DepositDetailsRoutingModule,
        MatCardModule,
        DetailsItemModule,
        StatusModule,
        MatProgressSpinnerModule,
        MatButtonModule,
        MatDialogModule,
        DepositMainInfoModule,
        RevertsModule,
    ],
    declarations: [DepositDetailsComponent],
})
export class DepositDetailsModule {}
