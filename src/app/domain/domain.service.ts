import { Injectable } from '@angular/core';
import { Commit, Snapshot } from '@vality/domain-proto/lib/domain_config';
import { Int64 } from '@vality/thrift-ts';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

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
