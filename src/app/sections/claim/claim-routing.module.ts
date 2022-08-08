import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppAuthGuardService, ClaimManagementRole } from '@cc/app/shared/services';

import { ClaimComponent } from './claim.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: 'party/:partyID/claim/:claimID',
                component: ClaimComponent,
                canActivate: [AppAuthGuardService],
                data: {
                    roles: [ClaimManagementRole.GetClaims],
                },
            },
        ]),
    ],
})
export class ClaimRoutingModule {}
