import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ThriftViewerModule } from '@vality/ng-thrift';

import { HeadlineModule } from '~/components/headline/headline.module';
import { PageLayoutModule } from '~/components/page-layout';
import { StatusModule } from '~/components/status';

import { DepositDetailsRoutingModule } from './deposit-details-routing.module';
import { DepositDetailsComponent } from './deposit-details.component';

@NgModule({
    imports: [
        CommonModule,
        HeadlineModule,
        DepositDetailsRoutingModule,
        MatCardModule,
        StatusModule,
        MatProgressSpinnerModule,
        MatButtonModule,
        MatDialogModule,
        PageLayoutModule,
        ThriftViewerModule,
    ],
    declarations: [DepositDetailsComponent],
})
export class DepositDetailsModule {}
