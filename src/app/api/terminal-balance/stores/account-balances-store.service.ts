import { Injectable } from '@angular/core';
import { AccountBalance } from '@vality/scrooge-proto/internal/account_balance';
import isNil from 'lodash-es/isNil';
import { of, Observable } from 'rxjs';
import { shareReplay, map, catchError, startWith } from 'rxjs/operators';

import { AccountBalanceService } from '../account-balance.service';

@Injectable({
    providedIn: 'root',
})
export class AccountBalancesStoreService {
    balances$: Observable<AccountBalance[]> = this.terminalBalanceService
        .GetTerminalBalances()
        .pipe(
            map((b) => b.balances),
            startWith([]),
            catchError(() => {
                console.error('Account balances are not loaded');
                return of([]);
            }),
            shareReplay({ refCount: true, bufferSize: 1 }),
        );

    constructor(private terminalBalanceService: AccountBalanceService) {}

    getAccountBalance(id: string | number) {
        return this.balances$.pipe(
            map((balances) => balances.find((b) => b.account_id === String(id))),
        );
    }

    getTerminalBalances(id: string | number, providerId?: string | number) {
        return this.balances$.pipe(
            map((balances) =>
                balances.filter(
                    (b) =>
                        !isNil(providerId) &&
                        b.provider.id === String(providerId) &&
                        b.terminal.id === String(id),
                ),
            ),
        );
    }
}
