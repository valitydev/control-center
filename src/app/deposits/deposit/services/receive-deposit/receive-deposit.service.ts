import { Injectable, inject } from '@angular/core';
import { FistfulStatistics } from '@vality/fistful-proto/fistful_stat';
import { NotifyLogService, inProgressFrom, progressTo } from '@vality/matez';
import { BehaviorSubject, EMPTY, ReplaySubject, Subject, defer } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';

import { createDsl } from '~/api/fistful-stat';

@Injectable()
export class ReceiveDepositService {
    private fistfulStatisticsService = inject(FistfulStatistics);
    private log = inject(NotifyLogService);

    deposit$ = defer(() => this.receiveDeposit$).pipe(
        switchMap((depositId) =>
            this.fistfulStatisticsService
                .GetDeposits({ dsl: createDsl({ deposits: { deposit_id: depositId, size: 1 } }) })
                .pipe(
                    catchError((err) => {
                        this.error$.next(true);
                        this.log.error(err);
                        return EMPTY;
                    }),
                )
                .pipe(progressTo(this.progress$)),
        ),
        map(({ data }) => data?.deposits[0]),
        shareReplay(1),
    );
    isLoading$ = inProgressFrom(() => this.progress$, this.deposit$);

    private receiveDeposit$ = new ReplaySubject<string>();
    private error$ = new Subject<boolean>();
    private progress$ = new BehaviorSubject(0);

    receiveDeposit(id: string) {
        this.receiveDeposit$.next(id);
    }
}
