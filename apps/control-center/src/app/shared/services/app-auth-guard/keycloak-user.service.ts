import { Injectable, inject, isDevMode } from '@angular/core';
import { observableResource } from '@vality/matez';
import Keycloak, { KeycloakProfile } from 'keycloak-js';
import { from, map } from 'rxjs';

export type KeycloakUserProfile = KeycloakProfile &
    Required<Pick<KeycloakProfile, 'id' | 'email' | 'username'>>;

@Injectable({
    providedIn: 'root',
})
export class KeycloakUserService {
    private keycloak = inject(Keycloak);

    get roles() {
        return [
            ...(this.keycloak.realmAccess?.roles || []),
            ...Object.values(this.keycloak.resourceAccess || {})
                .map((resourceAccess) => resourceAccess.roles)
                .flat(),
        ];
    }

    user = observableResource({
        loader: () =>
            from(this.keycloak.loadUserProfile()).pipe(
                map((profile) => {
                    if (!profile.id || !profile.email) {
                        throw new Error('User profile does not contain id or email');
                    }
                    return {
                        ...profile,
                        username: profile.username ?? profile.email,
                    } as KeycloakUserProfile;
                }),
            ),
    });

    logout() {
        return this.keycloak.logout();
    }

    hasRole(...roles: string[]): boolean {
        return isDevMode() || roles.every((r) => this.roles.includes(r));
    }

    hasServiceRole(...serviceMethods: string[]): boolean {
        if (!serviceMethods?.length) {
            return true;
        }
        const allowedServiceMethods = this.roles.map((r) => r.split(':'));
        return serviceMethods.some((serviceMethod) => {
            const [service, method] = serviceMethod.split(':');
            return allowedServiceMethods.some(
                ([s, m]) => service === s && (!method || method === m),
            );
        });
    }
}
