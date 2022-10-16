import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppAuthGuardService } from '@cc/app/shared/services';

import { ROUTING_CONFIG } from './routing-config';
import { SearchPaymentsComponent } from './search-payments.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: SearchPaymentsComponent,
                canActivate: [AppAuthGuardService],
                data: ROUTING_CONFIG,
            },
        ]),
    ],
    exports: [RouterModule],
})
export class SearchPaymentsRoutingModule {}
