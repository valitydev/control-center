import { Injectable } from '@angular/core';
import { UserInfo } from '@vality/domain-proto/lib/payment_processing';
import { Observable } from 'rxjs';
import { first, map, shareReplay } from 'rxjs/operators';

import { KeycloakTokenInfoService } from '@cc/app/shared/services';

@Injectable({
    providedIn: 'root',
})
export class UserInfoService {
    userInfo$: Observable<UserInfo> = this.keycloakTokenInfoService.decoded$.pipe(
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
