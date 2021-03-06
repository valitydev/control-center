import { Component, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

import {
    AppAuthGuardService,
    ClaimManagementRole,
    DomainConfigRole,
    OperationRole,
    PartyRole,
    PaymentAdjustmentRole,
    PayoutRole,
} from '@cc/app/shared/services';

@Component({
    selector: 'cc-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    username: string;

    menuItems: { name: string; route: string }[] = [];

    constructor(
        private keycloakService: KeycloakService,
        private appAuthGuardService: AppAuthGuardService
    ) {}

    ngOnInit() {
        void this.keycloakService.loadUserProfile().then(() => {
            this.username = this.keycloakService.getUsername();
            this.menuItems = this.getMenuItems();
        });
    }

    logout() {
        void this.keycloakService.logout();
    }

    private getMenuItems() {
        const menuItems = [
            { name: 'Domain config', route: '/domain', activateRoles: [DomainConfigRole.Checkout] },
            { name: 'Payouts', route: '/payouts', activateRoles: [PayoutRole.Read] },
            { name: 'Claims', route: '/claims', activateRoles: [ClaimManagementRole.GetClaims] },
            {
                name: 'Payment adjustment',
                route: '/payment-adjustment',
                activateRoles: [PaymentAdjustmentRole.Create],
            },
            { name: 'Merchants', route: '/parties', activateRoles: [PartyRole.Get] },
            {
                name: 'Repairing',
                route: '/old-repairing',
                activateRoles: [DomainConfigRole.Checkout],
            },
            {
                name: 'New repairing',
                route: '/repairing',
                activateRoles: [DomainConfigRole.Checkout],
            },
            {
                name: 'Operations',
                route: '/operations',
                activateRoles: [OperationRole.SearchOperations],
            },
            {
                name: 'Withdrawals',
                route: '/withdrawals',
            },
        ];
        return menuItems.filter((item) =>
            this.appAuthGuardService.userHasRoles(item.activateRoles)
        );
    }
}
