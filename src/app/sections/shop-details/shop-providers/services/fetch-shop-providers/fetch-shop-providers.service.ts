import { Injectable } from '@angular/core';
import { PartyID, ShopID } from '@vality/domain-proto';
import { combineLatest, defer, ReplaySubject } from 'rxjs';
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { progress } from '@cc/app/shared/custom-operators';

import { DomainStoreService } from '../../../../../thrift-services/damsel/domain-store.service';
import { toProvidersInfo } from './to-providers-info';

@Injectable()
export class FetchShopProvidersService {
    providersInfo$ = defer(() => this.getProvidersInfo$).pipe(
        switchMap(({ partyID, shopID }) =>
            combineLatest([
                this.domainStoreService.getObjects('provider'),
                this.domainStoreService.getObjects('terminal'),
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

    constructor(private domainStoreService: DomainStoreService) {
        this.providersInfo$.subscribe();
    }

    getProvidersInfo(partyID: PartyID, shopID: ShopID): void {
        this.getProvidersInfo$.next({ partyID, shopID });
    }
}
