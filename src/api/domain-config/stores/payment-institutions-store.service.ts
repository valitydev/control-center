import { Injectable, inject } from '@angular/core';
import { DomainObjectType } from '@vality/domain-proto/domain';
import { Repository, VersionedObject } from '@vality/domain-proto/domain_config_v2';
import { NotifyLogService, fetchAll, observableResource } from '@vality/matez';
import { catchError, map, of, shareReplay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PaymentInstitutionsStoreService {
    private repositoryService = inject(Repository);
    private log = inject(NotifyLogService);

    resource = observableResource({
        loader: () =>
            fetchAll((continuationToken) =>
                this.repositoryService.SearchFullObjects({
                    type: DomainObjectType.payment_institution,
                    query: '*',
                    limit: 1_000_000,
                    continuation_token: continuationToken,
                }),
            ).pipe(
                catchError((err) => {
                    this.log.errorOperation(err, 'receive', 'payment institutions');
                    return of<VersionedObject[]>([]);
                }),
            ),
    });

    paymentInstitutions$ = this.resource.value$.pipe(
        map((objs) => objs.map((obj) => obj.object.payment_institution)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    isLoading$ = this.resource.isLoading$;

    reload() {
        this.resource.reload();
    }
}
