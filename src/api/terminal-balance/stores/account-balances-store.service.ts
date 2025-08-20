import isNil from 'lodash-es/isNil';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay, startWith } from 'rxjs/operators';

import { Injectable, inject } from '@angular/core';

import { AccountBalance } from '@vality/scrooge-proto/account_balance';

import { ThriftAccountService } from '~/api/services';

@Injectable({
    providedIn: 'root',
})
export class AccountBalancesStoreService {
    private terminalBalanceService = inject(ThriftAccountService);
    balances$: Observable<AccountBalance[]> = this.terminalBalanceService.GetAccountBalances().pipe(
        map((b) => b.balances),
        startWith([]),
        catchError(() => {
            console.error('Account balances are not loaded');
            return of([]);
        }),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    getAccountBalance(id: string | number) {
        return this.balances$.pipe(
            map((balances) => balances.find((b) => b.account_id === String(id))),
        );
    }

    getTerminalBalances(
        id: string | number,
        providerId?: string | number,
    ): Observable<AccountBalance[]> {
        if (isNil(providerId)) {
            return of([]);
        }
        return this.balances$.pipe(
            map((balances) =>
                balances.filter(
                    (b) =>
                        b.provider.id === String(providerId) &&
                        b.terminal.id === String(id) &&
                        b.balance,
                ),
            ),
        );
    }
}
