import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';

import { ShopDetailsModule } from '@cc/app/shared/components';
import { PayoutToolDetailsModule } from '@cc/app/shared/components/payout-tool-details/payout-tool-details.module';
import { CommonPipesModule, ThriftPipesModule } from '@cc/app/shared/pipes';
import { DetailsItemModule } from '@cc/components/details-item';
import { EmptySearchResultModule } from '@cc/components/empty-search-result';
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
        FlexLayoutModule,
        MatTableModule,
        EmptySearchResultModule,
        MatPaginatorModule,
    ],
})
export class PayoutDetailsModule {}
