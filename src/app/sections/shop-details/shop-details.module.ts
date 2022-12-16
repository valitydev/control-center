import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { ActionsModule } from '@vality/ng-core';

import { JsonViewerModule } from '@cc/app/shared/components/json-viewer';
import { HeadlineModule } from '@cc/components/headline';

import { ThriftPipesModule } from '../../shared';
import { ShopDetailsRoutingModule } from './shop-details-routing.module';
import { ShopDetailsComponent } from './shop-details.component';

@NgModule({
    imports: [
        ShopDetailsRoutingModule,
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
    declarations: [ShopDetailsComponent],
})
export class ShopDetailsModule {}
