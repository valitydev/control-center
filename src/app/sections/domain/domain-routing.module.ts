import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppAuthGuardService } from '@cc/app/shared/services';

import { DomainInfoComponent } from './domain-info';
import { ROUTING_CONFIG } from './routing-config';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                canActivate: [AppAuthGuardService],
                data: ROUTING_CONFIG,
                component: DomainInfoComponent,
            },
        ]),
    ],
    exports: [RouterModule],
})
export class DomainRoutingModule {}
