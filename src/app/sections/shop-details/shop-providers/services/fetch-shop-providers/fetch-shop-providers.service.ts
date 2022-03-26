import { Injectable } from '@angular/core';
import { PartyID, ShopID } from '@vality/domain-proto';
import { combineLatest, defer, ReplaySubject } from 'rxjs';
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { progress } from '@cc/app/shared/custom-operators';

import { DomainCacheService } from '../../../../../thrift-services/damsel/domain-cache.service';
import { toProvidersInfo } from './to-providers-info';

@Injectable()
export class FetchShopProvidersService {
    providersInfo$ = defer(() => this.getProvidersInfo$).pipe(
        switchMap(({ partyID, shopID }) =>
            combineLatest([
                this.domainCacheService.getObjects('provider'),
                this.domainCacheService.getObjects('terminal'),
            ]).pipe(
                map(([providerObjects, terminalObjects]) =>
                    toProvidersInfo(providerObjects, terminalObjects, partyID, shopID)
                )
            )
        ),
        shareReplay(1)
    );

    inProgress$ = progress(
        defer(() => this.getProvidersInfo$),
        this.providersInfo$
    ).pipe(startWith(true));

    private getProvidersInfo$ = new ReplaySubject<{ partyID: PartyID; shopID: ShopID }>(1);

    constructor(private domainCacheService: DomainCacheService) {
        this.providersInfo$.subscribe();
    }

    getProvidersInfo(partyID: PartyID, shopID: ShopID): void {
        this.getProvidersInfo$.next({ partyID, shopID });
    }
}
