import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppAuthGuardService } from '@cc/app/shared/services';

import { ROUTING_CONFIG } from './routing-config';
import { SourcesComponent } from './sources.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: SourcesComponent,
                canActivate: [AppAuthGuardService],
                data: ROUTING_CONFIG,
            },
        ]),
    ],
    exports: [RouterModule],
})
export class SourcesRoutingModule {}
