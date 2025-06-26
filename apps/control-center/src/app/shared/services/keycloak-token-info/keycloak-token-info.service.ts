import { Injectable, inject } from '@angular/core';
import jwtDecode from 'jwt-decode';
import { KeycloakService } from 'keycloak-angular';
import { Observable, defer, of, switchMap } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { KeycloakToken } from './types/keycloak-token';

@Injectable({ providedIn: 'root' })
export class KeycloakTokenInfoService {
    private keycloakService = inject(KeycloakService);
    info$: Observable<KeycloakToken> = defer(() => this.token$).pipe(
        map((token) => ({
            ...jwtDecode<KeycloakToken>(token),
            token,
        })),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    private token$ = defer(() =>
        this.keycloakService.isTokenExpired() ? this.keycloakService.updateToken() : of(null),
    ).pipe(switchMap(() => this.keycloakService.getToken()));
}
