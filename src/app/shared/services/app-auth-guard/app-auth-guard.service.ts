import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlTree, RouterStateSnapshot } from '@angular/router';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';

import { environment } from '../../../../environments/environment';

@Injectable()
export class AppAuthGuardService extends KeycloakAuthGuard {
    constructor(
        protected override router: Router,
        protected override keycloakAngular: KeycloakService,
    ) {
        super(router, keycloakAngular);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async isAccessAllowed(
        route: ActivatedRouteSnapshot,
        _state: RouterStateSnapshot,
    ): Promise<boolean | UrlTree> {
        return (
            this.userHasSomeServiceMethods(route.data['services']) ||
            this.router.createUrlTree(['404'])
        );
    }

    userHasSomeServiceMethods(serviceMethods: string[]): boolean {
        if ((!environment.production && environment.ignoreRoles) || !serviceMethods?.length) {
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
        return roles.every((role) => this.keycloakAngular.getUserRoles(true).includes(role));
    }
}
