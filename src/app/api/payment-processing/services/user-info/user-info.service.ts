import { Injectable } from '@angular/core';
import { first, map, shareReplay } from 'rxjs/operators';

import { KeycloakTokenInfoService } from '@cc/app/shared/services';

@Injectable({
    providedIn: 'root',
})
export class UserInfoService {
    userInfo$ = this.keycloakTokenInfoService.decoded$.pipe(
        map(({ sub }) => ({
            id: sub,
            type: { internal_user: {} },
        })),
        shareReplay({ refCount: true, bufferSize: 1 })
    );

    constructor(private keycloakTokenInfoService: KeycloakTokenInfoService) {}

    getUserInfo() {
        return this.userInfo$.pipe(first());
    }
}
