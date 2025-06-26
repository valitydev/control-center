import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, NEVER, ReplaySubject, Subject } from 'rxjs';
import { catchError, shareReplay, switchMap, tap } from 'rxjs/operators';

import { ManagementService } from '../../../../../api/wallet/management.service';

@Injectable()
export class ReceiveWalletService {
    private walletManagementService = inject(ManagementService);
    private destroyRef = inject(DestroyRef);
    private receiveWallet$ = new ReplaySubject<string>();
    private error$ = new Subject<boolean>();
    private loading$ = new BehaviorSubject(false);

    wallet$ = this.receiveWallet$.pipe(
        tap(() => this.loading$.next(true)),
        switchMap((id) =>
            this.walletManagementService.Get(id, {}).pipe(
                catchError((e) => {
                    console.error(e);
                    this.loading$.next(false);
                    this.error$.next(true);
                    return NEVER;
                }),
            ),
        ),
        tap(() => this.loading$.next(false)),
        takeUntilDestroyed(this.destroyRef),
        shareReplay(1),
    );

    isLoading$ = this.loading$.asObservable();

    hasError$ = this.error$.asObservable();

    receiveWallet(id: string): void {
        this.receiveWallet$.next(id);
    }
}
