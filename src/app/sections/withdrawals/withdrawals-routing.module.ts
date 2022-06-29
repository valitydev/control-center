import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppAuthGuardService } from '@cc/app/shared/services';

import { WithdrawalsComponent } from './withdrawals.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: WithdrawalsComponent,
                canActivate: [AppAuthGuardService],
                data: {
                    roles: [],
                },
            },
        ]),
    ],
})
export class WithdrawalsRoutingModule {}
