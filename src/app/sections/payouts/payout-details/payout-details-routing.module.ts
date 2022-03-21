import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppAuthGuardService } from '@cc/app/shared/services';

import { PayoutDetailsComponent } from './payout-details.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: PayoutDetailsComponent,
                canActivate: [AppAuthGuardService],
                data: {
                    roles: ['payout:read'],
                },
            },
        ]),
    ],
    exports: [RouterModule],
})
export class PayoutDetailsRoutingModule {}
