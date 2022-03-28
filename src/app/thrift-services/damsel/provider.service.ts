import { Injectable } from '@angular/core';
import { ProviderObject } from '@vality/domain-proto/lib/domain';
import { combineLatest, Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { DomainCacheService } from './domain-cache.service';
import { findDomainObject } from './operations/utils';

@Injectable()
export class ProviderService {
    constructor(private domainCacheService: DomainCacheService) {}

    getProviderFromParams<T extends { providerID: number }>(
        p: T
    ): Observable<readonly [T, ProviderObject]> {
        return combineLatest([of(p), this.domainCacheService.getObjects('provider')]).pipe(
            take(1),
            map(
                ([params, providerObject]) =>
                    [params, findDomainObject(providerObject, params.providerID)] as const
            )
        );
    }
}
