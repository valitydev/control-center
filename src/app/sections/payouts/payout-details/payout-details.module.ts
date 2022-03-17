import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule, FlexModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

import { ShopDetailsModule } from '@cc/app/shared/components';
import { CommonPipesModule, ThriftPipesModule } from '@cc/app/shared/pipes';
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
        FlexModule,
        MatCardModule,
        DetailsItemModule,
        MatDividerModule,
        FlexLayoutModule,
        CommonPipesModule,
        ThriftPipesModule,
        ShopDetailsModule,
    ],
})
export class PayoutDetailsModule {}
