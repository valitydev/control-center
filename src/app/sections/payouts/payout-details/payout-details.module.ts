import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ActionsModule, TableModule } from '@vality/ng-core';
import { ThriftPipesModule } from '@vality/ng-thrift';

import { ShopDetailsModule, PageLayoutModule } from '@cc/app/shared/components';
import { PayoutToolDetailsModule } from '@cc/app/shared/components/payout-tool-details/payout-tool-details.module';
import { CommonPipesModule } from '@cc/app/shared/pipes';
import { DetailsItemModule } from '@cc/components/details-item';
import { HeadlineModule } from '@cc/components/headline';

import { PayoutDetailsRoutingModule } from './payout-details-routing.module';
import { PayoutDetailsComponent } from './payout-details.component';

@NgModule({
    declarations: [PayoutDetailsComponent],
    imports: [
        CommonModule,
        PayoutDetailsRoutingModule,
        HeadlineModule,
        MatCardModule,
        DetailsItemModule,
        MatDividerModule,
        CommonPipesModule,
        ThriftPipesModule,
        ShopDetailsModule,
        PayoutToolDetailsModule,
        MatPaginatorModule,
        MatButtonModule,
        ActionsModule,
        TableModule,
        PageLayoutModule,
    ],
})
export class PayoutDetailsModule {}
