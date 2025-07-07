import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppAuthGuardService } from '../../shared/services';

import { DomainObjectsComponent } from './domain-objects';
import { ROUTING_CONFIG } from './routing-config';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                canActivate: [AppAuthGuardService],
                data: ROUTING_CONFIG,
                component: DomainObjectsComponent,
            },
        ]),
    ],
    exports: [RouterModule],
})
export class DomainRoutingModule {}
