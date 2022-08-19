import { Injectable } from '@angular/core';
import { DomainObject, Reference } from '@vality/domain-proto/lib/domain';
import { Commit, Snapshot } from '@vality/domain-proto/lib/domain_config';
import { Int64 } from '@vality/thrift-ts';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { toJson } from '@cc/utils/thrift-json-converter';

import { toGenCommit, toGenReference } from '../thrift-services/converters';
import { DomainService as ThriftDomainService } from '../thrift-services/damsel/domain.service';

/**
 * @deprecated duplicates thrift-services/damsel/domain-cache.service
 */
@Injectable()
export class DomainService {
    private shapshot$: Observable<Snapshot>;

    constructor(private thriftDomainService: ThriftDomainService) {
        this.updateSnapshot();
    }

    /**
     * @deprecated use DomainCacheService -> snapshot$
     */
    get shapshot() {
        return this.shapshot$;
    }

    /**
     * @deprecated use DomainCacheService -> version$
     */
    get version$(): Observable<number> {
        return this.shapshot$.pipe(
            map(({ version }) => (version ? (version as unknown as Int64).toNumber() : undefined))
        );
    }

    /**
     * @deprecated use DomainCacheService -> getObjects or specific service from thrift-services/damsel
     */
    getDomainObject(ref: Reference): Observable<DomainObject | null> {
        return this.shapshot$.pipe(
            map(({ domain }) => {
                const searchRef = JSON.stringify(ref);
                for (const [k, v] of domain) {
                    const domainRef = JSON.stringify(toJson(k));
                    if (domainRef === searchRef) {
                        return v;
                    }
                }
                return null;
            })
        );
    }

    /**
     * @deprecated use DomainCacheService -> forceReload()
     */
    updateSnapshot() {
        return (this.shapshot$ = this.thriftDomainService.checkout(toGenReference()));
    }

    /**
     * @deprecated use DomainCacheService -> commit()
     */
    commit(commit: Commit) {
        return this.shapshot$.pipe(
            switchMap(({ version }) =>
                this.thriftDomainService.commit(version, toGenCommit(commit))
            )
        );
    }
}
