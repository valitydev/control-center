import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppAuthGuardService } from '@cc/app/shared/services';

import { DomainInfoComponent } from './domain-info';
import { DomainObjCreationComponent } from './domain-obj-creation';
import { DomainObjModificationComponent } from './domain-obj-modification';
import { DomainObjReviewComponent } from './domain-obj-review';
import { ROUTING_CONFIG } from './routing-config';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                canActivate: [AppAuthGuardService],
                data: ROUTING_CONFIG,
                children: [
                    {
                        path: '',
                        component: DomainInfoComponent,
                    },
                    {
                        path: 'create',
                        component: DomainObjCreationComponent,
                    },
                    {
                        path: 'edit',
                        component: DomainObjModificationComponent,
                    },
                    {
                        path: 'review',
                        component: DomainObjReviewComponent,
                    },
                ],
            },
        ]),
    ],
    exports: [RouterModule],
})
export class DomainRoutingModule {}
