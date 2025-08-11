import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';


import { ROUTING_CONFIG } from './routing-config';
import { SourcesComponent } from './sources.component';

import { canActivateAuthRole } from '~/services';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: SourcesComponent,
                canActivate: [canActivateAuthRole],
                data: ROUTING_CONFIG,
            },
        ]),
    ],
    exports: [RouterModule],
})
export class SourcesRoutingModule {}
