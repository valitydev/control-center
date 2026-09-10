import { Routes } from '@angular/router';

import { canActivateAuthRole } from '~/services';

import { OrganizationsListComponent } from './components/organizations-list/organizations-list.component';
import { ROUTING_CONFIG } from './routing-config';

export const ORGANIZATIONS_ROUTES: Routes = [
    {
        path: '',
        component: OrganizationsListComponent,
        canActivate: [canActivateAuthRole],
        data: ROUTING_CONFIG,
    },
];
