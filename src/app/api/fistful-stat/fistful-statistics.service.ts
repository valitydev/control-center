import { Injectable } from '@angular/core';
import {
    fistful_stat_FistfulStatisticsCodegenClient,
    ThriftAstMetadata,
    fistful_stat_FistfulStatistics,
} from '@vality/fistful-proto';
import { StatRequest, StatResponse } from '@vality/fistful-proto/fistful_stat';
import { combineLatest, from, map, Observable, switchMap } from 'rxjs';

import { KeycloakTokenInfoService, toWachterHeaders } from '@cc/app/shared/services';
import { environment } from '@cc/environments/environment';

@Injectable({ providedIn: 'root' })
export class FistfulStatisticsService {
    private client$: Observable<fistful_stat_FistfulStatisticsCodegenClient>;

    constructor(private keycloakTokenInfoService: KeycloakTokenInfoService) {
        const headers$ = this.keycloakTokenInfoService.decoded$.pipe(
            map(toWachterHeaders('FistfulStatistics'))
        );
        const metadata$ = from(
            import('@vality/fistful-proto/metadata.json').then(
                (m) => m.default as ThriftAstMetadata[]
            )
        );
        this.client$ = combineLatest([metadata$, headers$]).pipe(
            switchMap(([metadata, headers]) =>
                fistful_stat_FistfulStatistics({
                    metadata,
                    headers,
                    logging: environment.logging.requests,
                    path: '/wachter',
                })
            )
        );
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    GetWallets(req: StatRequest): Observable<StatResponse> {
        return this.client$.pipe(switchMap((c) => c.GetWallets(req)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    GetWithdrawals(req: StatRequest): Observable<StatResponse> {
        return this.client$.pipe(switchMap((c) => c.GetWithdrawals(req)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    GetDeposits(req: StatRequest): Observable<StatResponse> {
        return this.client$.pipe(switchMap((c) => c.GetDeposits(req)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    GetDepositReverts(req: StatRequest): Observable<StatResponse> {
        return this.client$.pipe(switchMap((c) => c.GetDepositReverts(req)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    GetSources(req: StatRequest): Observable<StatResponse> {
        return this.client$.pipe(switchMap((c) => c.GetSources(req)));
    }
}
