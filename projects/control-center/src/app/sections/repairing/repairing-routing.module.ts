import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppAuthGuardService } from '../../shared/services';
import { RepairingComponent } from './repairing.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: RepairingComponent,
                canActivate: [AppAuthGuardService],
                data: {
                    roles: [],
                },
            },
        ]),
    ],
    exports: [RouterModule],
})
export class RepairingRoutingModule {}
