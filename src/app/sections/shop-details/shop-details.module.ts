import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActionsModule } from '@vality/ng-core';

import { JsonViewerModule } from '@cc/app/shared/components/json-viewer';
import { HeadlineModule } from '@cc/components/headline';

import { ThriftPipesModule } from '../../shared';
import { ShopContractInfoComponent } from './components/shop-contract-info/shop-contract-info.component';
import { ShopDetailsRoutingModule } from './shop-details-routing.module';
import { ShopDetailsComponent } from './shop-details.component';
import { ShopMainInfoModule } from './shop-main-info';

@NgModule({
    imports: [
        ShopDetailsRoutingModule,
        ShopMainInfoModule,
        HeadlineModule,
        FlexModule,
        MatCardModule,
        CommonModule,
        MatProgressSpinnerModule,
        ActionsModule,
        MatButtonModule,
        ThriftPipesModule,
        JsonViewerModule,
    ],
    declarations: [ShopDetailsComponent, ShopContractInfoComponent],
})
export class ShopDetailsModule {}
