import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppAuthGuardService } from '../../shared/services';

import { SHOPS_ROUTING_CONFIG } from './shops-routing-config';
import { ShopsComponent } from './shops.component';

const ROUTES: Routes = [
    {
        path: '',
        component: ShopsComponent,
        canActivate: [AppAuthGuardService],
        data: SHOPS_ROUTING_CONFIG,
    },
];

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class ShopsRoutingModule {}
