import { Injectable } from '@angular/core';
import {
    repairer_RepairManagementCodegenClient,
    ThriftAstMetadata,
    repairer_RepairManagement,
} from '@vality/repairer-proto';
import {
    SearchRequest,
    SearchResponse,
    SimpleRepairRequest,
    RepairWithdrawalsRequest,
    RepairInvoicesRequest,
} from '@vality/repairer-proto/repairer';
import { combineLatest, from, map, Observable, switchMap } from 'rxjs';

import { KeycloakTokenInfoService, toWachterHeaders } from '@cc/app/shared/services';
import { environment } from '@cc/environments/environment';

@Injectable({ providedIn: 'root' })
export class RepairManagementService {
    private client$: Observable<repairer_RepairManagementCodegenClient>;

    constructor(private keycloakTokenInfoService: KeycloakTokenInfoService) {
        const headers$ = this.keycloakTokenInfoService.decoded$.pipe(
            map(toWachterHeaders('RepairManagement')),
        );
        const metadata$ = from(
            import('@vality/repairer-proto/metadata.json').then(
                (m) => m.default as ThriftAstMetadata[],
            ),
        );
        this.client$ = combineLatest([metadata$, headers$]).pipe(
            switchMap(([metadata, headers]) =>
                repairer_RepairManagement({
                    metadata,
                    headers,
                    logging: environment.logging.requests,
                    path: '/wachter',
                }),
            ),
        );
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    Search(request: SearchRequest): Observable<SearchResponse> {
        return this.client$.pipe(switchMap((c) => c.Search(request)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    SimpleRepairAll(request: SimpleRepairRequest): Observable<void> {
        return this.client$.pipe(switchMap((c) => c.SimpleRepairAll(request)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    RepairWithdrawals(request: RepairWithdrawalsRequest): Observable<void> {
        return this.client$.pipe(switchMap((c) => c.RepairWithdrawals(request)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    RepairInvoices(request: RepairInvoicesRequest): Observable<void> {
        return this.client$.pipe(switchMap((c) => c.RepairInvoices(request)));
    }
}
