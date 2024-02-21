import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { StatusModule, PageLayoutModule } from '@cc/app/shared/components';
import { DetailsItemModule } from '@cc/components/details-item';
import { HeadlineModule } from '@cc/components/headline';

import { ThriftViewerModule } from '../../shared/components/thrift-viewer';

import { DepositDetailsRoutingModule } from './deposit-details-routing.module';
import { DepositDetailsComponent } from './deposit-details.component';
import { RevertsModule } from './reverts/reverts.module';

@NgModule({
    imports: [
        CommonModule,
        HeadlineModule,
        DepositDetailsRoutingModule,
        MatCardModule,
        DetailsItemModule,
        StatusModule,
        MatProgressSpinnerModule,
        MatButtonModule,
        MatDialogModule,
        RevertsModule,
        PageLayoutModule,
        ThriftViewerModule,
    ],
    declarations: [DepositDetailsComponent],
})
export class DepositDetailsModule {}
