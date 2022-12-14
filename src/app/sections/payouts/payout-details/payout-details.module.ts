import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { ActionsModule } from '@vality/ng-core';

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
        MatButtonModule,
        ActionsModule,
    ],
})
export class PayoutDetailsModule {}
