import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppAuthGuardService } from '@cc/app/shared/services';

import { PaymentsComponent } from './payments.component';
import { ROUTING_CONFIG } from './routing-config';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: PaymentsComponent,
                canActivate: [AppAuthGuardService],
                data: ROUTING_CONFIG,
            },
        ]),
    ],
    exports: [RouterModule],
})
export class PaymentsRoutingModule {}
