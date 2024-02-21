import { Injectable } from '@angular/core';
import { NotifyLogService } from '@vality/ng-core';
import { merge, ReplaySubject, Subject, EMPTY } from 'rxjs';
import { catchError, switchMap, shareReplay, map } from 'rxjs/operators';

import { FistfulStatisticsService, createDsl } from '@cc/app/api/fistful-stat';
import { progress } from '@cc/app/shared/custom-operators';

@Injectable()
export class ReceiveDepositService {
    private receiveDeposit$ = new ReplaySubject<string>();
    private error$ = new Subject<boolean>();

    // eslint-disable-next-line @typescript-eslint/member-ordering
    deposit$ = this.receiveDeposit$.pipe(
        switchMap((depositId) =>
            this.fistfulStatisticsService
                .GetDeposits({ dsl: createDsl({ deposits: { deposit_id: depositId, size: 1 } }) })
                .pipe(
                    catchError((err) => {
                        this.error$.next(true);
                        this.log.error(err);
                        return EMPTY;
                    }),
                ),
        ),
        map(({ data }) => data?.deposits[0]),
        shareReplay(1),
    );

    // eslint-disable-next-line @typescript-eslint/member-ordering
    isLoading$ = progress(this.receiveDeposit$, merge(this.deposit$, this.error$));

    constructor(
        private fistfulStatisticsService: FistfulStatisticsService,
        private log: NotifyLogService,
    ) {}

    receiveDeposit(id: string) {
        this.receiveDeposit$.next(id);
    }
}
