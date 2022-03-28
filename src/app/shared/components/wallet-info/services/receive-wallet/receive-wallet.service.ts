import { Injectable } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, NEVER, ReplaySubject, Subject } from 'rxjs';
import { catchError, switchMap, shareReplay, tap } from 'rxjs/operators';

import { ManagementService } from '@cc/app/api/wallet';

@UntilDestroy()
@Injectable()
export class ReceiveWalletService {
    private receiveWallet$ = new ReplaySubject<string>();
    private error$ = new Subject<boolean>();
    private loading$ = new BehaviorSubject(false);

    // eslint-disable-next-line @typescript-eslint/member-ordering
    wallet$ = this.receiveWallet$.pipe(
        tap(() => this.loading$.next(true)),
        switchMap((id) =>
            this.walletManagementService.Get(id, {}).pipe(
                catchError((e) => {
                    console.error(e);
                    this.loading$.next(false);
                    this.error$.next(true);
                    return NEVER;
                })
            )
        ),
        tap(() => this.loading$.next(false)),
        untilDestroyed(this),
        shareReplay(1)
    );

    // eslint-disable-next-line @typescript-eslint/member-ordering
    isLoading$ = this.loading$.asObservable();
    // eslint-disable-next-line @typescript-eslint/member-ordering
    hasError$ = this.error$.asObservable();

    constructor(private walletManagementService: ManagementService) {}

    receiveWallet(id: string): void {
        this.receiveWallet$.next(id);
    }
}
