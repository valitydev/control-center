import { AuthGuardData, createAuthGuard } from 'keycloak-angular';

import { inject } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivateFn,
    Router,
    RouterStateSnapshot,
    UrlTree,
} from '@angular/router';

import { KeycloakUserService } from './keycloak-user.service';
import { RoutingConfig } from './types/routing-config';

const isAccessAllowed = async (
    route: ActivatedRouteSnapshot,
    _: RouterStateSnapshot,
    authData: AuthGuardData,
): Promise<boolean | UrlTree> => {
    const keycloakUserService = inject(KeycloakUserService);
    const { authenticated } = authData;
    const data = route.data as RoutingConfig;
    const services = data.services || [];

    if (authenticated && keycloakUserService.hasRole(...services)) {
        return true;
    }

    const router = inject(Router);
    return router.parseUrl('/404');
};

export const canActivateAuthRole = createAuthGuard<CanActivateFn>(isAccessAllowed);
