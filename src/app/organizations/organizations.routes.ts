import { Routes } from '@angular/router';

import { canActivateAuthRole } from '~/services';

import { InvitationsComponent } from './components/invitations/invitations.component';
import { MembersComponent } from './components/members/members.component';
import { OrganizationsListComponent } from './components/organizations-list/organizations-list.component';
import { OrganizationsComponent } from './organizations.component';
import { ROUTING_CONFIG } from './routing-config';

export const ORGANIZATIONS_ROUTES: Routes = [
    {
        path: '',
        component: OrganizationsComponent,
        canActivate: [canActivateAuthRole],
        data: ROUTING_CONFIG,
        children: [
            {
                path: '',
                component: OrganizationsListComponent,
            },
            {
                path: 'invitations',
                component: InvitationsComponent,
            },
            {
                path: 'members',
                component: MembersComponent,
            },
        ],
    },
];
