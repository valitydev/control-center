import { Injectable } from '@angular/core';
import {
    ThriftAstMetadata,
    repairer_RepairManagement,
    repairer_RepairManagementCodegenClient,
} from '@vality/repairer-proto';
import {
    RepairInvoicesRequest,
    RepairWithdrawalsRequest,
    SearchRequest,
    SearchResponse,
    SimpleRepairRequest,
} from '@vality/repairer-proto/repairer';
import { Observable, combineLatest, from, map, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ConfigService } from '../../core/config.service';
import { KeycloakTokenInfoService, toWachterHeaders } from '../../shared/services';

@Injectable({ providedIn: 'root' })
export class RepairManagementService {
    private client$: Observable<repairer_RepairManagementCodegenClient>;

    constructor(
        private keycloakTokenInfoService: KeycloakTokenInfoService,
        configService: ConfigService,
    ) {
        const headers$ = this.keycloakTokenInfoService.info$.pipe(
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
                    ...configService.config.api.wachter,
                }),
            ),
        );
    }

    Search(request: SearchRequest): Observable<SearchResponse> {
        return this.client$.pipe(switchMap((c) => c.Search(request)));
    }

    SimpleRepairAll(request: SimpleRepairRequest): Observable<void> {
        return this.client$.pipe(switchMap((c) => c.SimpleRepairAll(request)));
    }

    RepairWithdrawals(request: RepairWithdrawalsRequest): Observable<void> {
        return this.client$.pipe(switchMap((c) => c.RepairWithdrawals(request)));
    }

    RepairInvoices(request: RepairInvoicesRequest): Observable<void> {
        return this.client$.pipe(switchMap((c) => c.RepairInvoices(request)));
    }
}
