import { Injectable } from '@angular/core';
import {
    RepairManagement,
    ThriftAstMetadata,
    RepairManagementCodegenClient,
} from '@vality/repairer-proto';
import {
    SearchRequest,
    SearchResponse,
    SimpleRepairRequest,
    RepairWithdrawalsRequest,
    RepairInvoicesRequest,
} from '@vality/repairer-proto/repairer';
import { combineLatest, from, map, Observable, switchMap } from 'rxjs';

import { KeycloakTokenInfoService, toWacherHeaders } from '@cc/app/shared/services';
import { environment } from '@cc/environments/environment';

@Injectable({ providedIn: 'root' })
export class RepairManagementService {
    private client$: Observable<RepairManagementCodegenClient>;

    constructor(private keycloakTokenInfoService: KeycloakTokenInfoService) {
        const headers$ = this.keycloakTokenInfoService.decoded$.pipe(
            map(toWacherHeaders('RepairManagement'))
        );
        const metadata$ = from(
            import('@vality/repairer-proto/metadata.json').then(
                (m) => m.default as ThriftAstMetadata[]
            )
        );
        this.client$ = combineLatest([metadata$, headers$]).pipe(
            switchMap(([metadata, headers]) =>
                RepairManagement({
                    metadata,
                    headers,
                    logging: environment.logging.requests,
                })
            )
        );
    }

    search(request: SearchRequest): Observable<SearchResponse> {
        return this.client$.pipe(switchMap((c) => c.Search(request)));
    }

    simpleRepairAll(request: SimpleRepairRequest): Observable<void> {
        return this.client$.pipe(switchMap((c) => c.SimpleRepairAll(request)));
    }

    repairWithdrawals(request: RepairWithdrawalsRequest): Observable<void> {
        return this.client$.pipe(switchMap((c) => c.RepairWithdrawals(request)));
    }

    repairInvoices(request: RepairInvoicesRequest): Observable<void> {
        return this.client$.pipe(switchMap((c) => c.RepairInvoices(request)));
    }
}
