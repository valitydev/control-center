import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppAuthGuardService } from '@cc/app/shared/services';

import { ROUTING_CONFIG } from './routing-config';
import { ShopDetailsComponent } from './shop-details.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: ShopDetailsComponent,
                canActivate: [AppAuthGuardService],
                data: ROUTING_CONFIG,
            },
        ]),
    ],
})
export class ShopDetailsRoutingModule {}
