import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppAuthGuardService } from '../../shared/services';

import { ROUTING_CONFIG } from './routing-config';
import { TerminalsComponent } from './terminals.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: TerminalsComponent,
                canActivate: [AppAuthGuardService],
                data: ROUTING_CONFIG,
            },
        ]),
    ],
    exports: [RouterModule],
})
export class TerminalsRoutingModule {}
