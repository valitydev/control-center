import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';

import { environment } from '../../../../environments/environment';

import { ManagerUiService } from './manager-ui.service';

@Injectable({ providedIn: 'root' })
export class AppAuthGuardService extends KeycloakAuthGuard {
    private managerUiService = inject(ManagerUiService);

    constructor(
        // eslint-disable-next-line @angular-eslint/prefer-inject
        protected override router: Router,
        // eslint-disable-next-line @angular-eslint/prefer-inject
        protected override keycloakAngular: KeycloakService,
    ) {
        super(router, keycloakAngular);
    }

    async isAccessAllowed(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ): Promise<boolean | UrlTree> {
        if (this.managerUiService.isManagerUi() === true) {
            const partyId = this.managerUiService.partyId();
            if (partyId && !state.url.startsWith(`/party/${partyId}`)) {
                return this.router.createUrlTree(['/party', partyId]);
            }
        }
        return (
            this.userHasSomeServiceMethods(route.data['services']) ||
            this.router.createUrlTree(['404'])
        );
    }

    userHasSomeServiceMethods(serviceMethods: string[]): boolean {
        if (this.ignoreRoles() || !serviceMethods?.length) {
            return true;
        }
        const allowedServiceMethods = this.keycloakAngular
            .getUserRoles(true)
            .map((r) => r.split(':'));
        return serviceMethods.some((serviceMethod) => {
            const [service, method] = serviceMethod.split(':');
            return allowedServiceMethods.some(
                ([s, m]) => service === s && (!method || method === m),
            );
        });
    }

    userHasRoles(roles: string[]): boolean {
        return (
            this.ignoreRoles() ||
            roles.every((role) => this.keycloakAngular.getUserRoles(true).includes(role))
        );
    }

    private ignoreRoles(): boolean {
        return !environment.production && environment.ignoreRoles;
    }
}
