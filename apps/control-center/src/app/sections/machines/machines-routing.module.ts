import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppAuthGuardService } from '../../shared/services';

import { MachinesComponent } from './machines.component';
import { ROUTING_CONFIG } from './routing-config';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: MachinesComponent,
                canActivate: [AppAuthGuardService],
                data: ROUTING_CONFIG,
            },
        ]),
    ],
    exports: [RouterModule],
})
export class MachinesRoutingModule {}
