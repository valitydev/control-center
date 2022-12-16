import { Injectable } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import jwt_decode from 'jwt-decode';
import { KeycloakService } from 'keycloak-angular';
import { Observable, defer, switchMap, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { KeycloakToken } from './types/keycloak-token';

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class KeycloakTokenInfoService {
    token$ = defer(() =>
        this.keycloakService.isTokenExpired() ? this.keycloakService.updateToken() : of(null)
    ).pipe(switchMap(() => this.keycloakService.getToken()));
    decoded$: Observable<KeycloakToken> = this.token$.pipe(
        map((token) => ({
            ...jwt_decode<KeycloakToken>(token),
            token,
        })),
        untilDestroyed(this),
        shareReplay(1)
    );

    constructor(private keycloakService: KeycloakService) {}
}
