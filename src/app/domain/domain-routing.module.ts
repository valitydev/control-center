import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppAuthGuardService, DomainConfigRole } from '@cc/app/shared/services';

import { DomainInfoComponent } from './domain-info';
import { DomainObjCreationComponent } from './domain-obj-creation';
import { DomainObjModificationComponent } from './domain-obj-modification';
import { DomainObjReviewComponent } from './domain-obj-review';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: 'domain',
                component: DomainInfoComponent,
                canActivate: [AppAuthGuardService],
                data: {
                    roles: [DomainConfigRole.Checkout],
                },
            },
            {
                path: 'domain/create',
                component: DomainObjCreationComponent,
                canActivate: [AppAuthGuardService],
                data: {
                    roles: [DomainConfigRole.Checkout],
                },
            },
            {
                path: 'domain/edit/:ref',
                component: DomainObjModificationComponent,
                canActivate: [AppAuthGuardService],
                data: {
                    roles: [DomainConfigRole.Checkout],
                },
            },
            {
                path: 'domain/edit/:ref/review',
                component: DomainObjReviewComponent,
                canActivate: [AppAuthGuardService],
                data: {
                    roles: [DomainConfigRole.Checkout],
                },
            },
        ]),
    ],
    exports: [RouterModule],
})
export class DomainRoutingModule {}
