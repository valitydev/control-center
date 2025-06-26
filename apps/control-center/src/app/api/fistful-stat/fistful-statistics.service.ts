import { Injectable, inject } from '@angular/core';
import {
    ThriftAstMetadata,
    fistful_stat_FistfulStatistics,
    fistful_stat_FistfulStatisticsCodegenClient,
} from '@vality/fistful-proto';
import { StatRequest, StatResponse } from '@vality/fistful-proto/fistful_stat';
import { Observable, combineLatest, from, map, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ConfigService } from '../../core/config.service';
import { KeycloakTokenInfoService, toWachterHeaders } from '../../shared/services';

@Injectable({ providedIn: 'root' })
export class FistfulStatisticsService {
    private keycloakTokenInfoService = inject(KeycloakTokenInfoService);
    private client$: Observable<fistful_stat_FistfulStatisticsCodegenClient>;

    constructor() {
        const configService = inject(ConfigService);
        const headers$ = this.keycloakTokenInfoService.info$.pipe(
            map(toWachterHeaders('FistfulStatistics')),
        );
        const metadata$ = from(
            import('@vality/fistful-proto/metadata.json').then(
                (m) => m.default as ThriftAstMetadata[],
            ),
        );
        this.client$ = combineLatest([metadata$, headers$]).pipe(
            switchMap(([metadata, headers]) =>
                fistful_stat_FistfulStatistics({
                    metadata,
                    headers,
                    logging: environment.logging.requests,
                    ...configService.config.api.wachter,
                }),
            ),
        );
    }

    GetWallets(req: StatRequest): Observable<StatResponse> {
        return this.client$.pipe(switchMap((c) => c.GetWallets(req)));
    }

    GetWithdrawals(req: StatRequest): Observable<StatResponse> {
        return this.client$.pipe(switchMap((c) => c.GetWithdrawals(req)));
    }

    GetDeposits(req: StatRequest): Observable<StatResponse> {
        return this.client$.pipe(switchMap((c) => c.GetDeposits(req)));
    }

    GetDepositReverts(req: StatRequest): Observable<StatResponse> {
        return this.client$.pipe(switchMap((c) => c.GetDepositReverts(req)));
    }

    GetSources(req: StatRequest): Observable<StatResponse> {
        return this.client$.pipe(switchMap((c) => c.GetSources(req)));
    }
}
