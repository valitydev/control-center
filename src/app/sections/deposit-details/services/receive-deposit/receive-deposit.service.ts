import { Injectable } from '@angular/core';
import { merge, ReplaySubject, Subject, EMPTY } from 'rxjs';
import { catchError, switchMap, pluck, shareReplay } from 'rxjs/operators';

import { FistfulStatisticsService } from '@cc/app/api/deprecated-fistful';
import { progress } from '@cc/app/shared/custom-operators';

import { NotificationErrorService } from '../../../../shared/services/notification-error';

@Injectable()
export class ReceiveDepositService {
    private receiveDeposit$ = new ReplaySubject<string>();
    private error$ = new Subject<boolean>();

    // eslint-disable-next-line @typescript-eslint/member-ordering
    deposit$ = this.receiveDeposit$.pipe(
        switchMap((depositId) =>
            this.fistfulStatisticsService.getDeposits({ depositId } as any, null).pipe(
                catchError((err) => {
                    this.error$.next(true);
                    this.notificationErrorService.error(err);
                    return EMPTY;
                })
            )
        ),
        pluck('result', 0),
        shareReplay(1)
    );

    // eslint-disable-next-line @typescript-eslint/member-ordering
    isLoading$ = progress(this.receiveDeposit$, merge(this.deposit$, this.error$));

    constructor(
        private fistfulStatisticsService: FistfulStatisticsService,
        private notificationErrorService: NotificationErrorService
    ) {}

    receiveDeposit(id: string) {
        this.receiveDeposit$.next(id);
    }
}
