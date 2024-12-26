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
