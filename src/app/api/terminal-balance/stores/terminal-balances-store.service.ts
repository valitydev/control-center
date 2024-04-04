import { Injectable } from '@angular/core';
import { TerminalBalance } from '@vality/scrooge-proto/internal/terminal_balance';
import { of, Observable } from 'rxjs';
import { shareReplay, map, catchError, startWith } from 'rxjs/operators';

import { TerminalBalanceService } from '../terminal-balance.service';

@Injectable({
    providedIn: 'root',
})
export class TerminalBalancesStoreService {
    balances$: Observable<TerminalBalance[]> = this.terminalBalanceService
        .GetTerminalBalances()
        .pipe(
            map((b) => b.balances),
            startWith([]),
            catchError(() => {
                console.error('Terminal balances are not loaded');
                return of([]);
            }),
            shareReplay({ refCount: true, bufferSize: 1 }),
        );

    constructor(private terminalBalanceService: TerminalBalanceService) {}

    getTerminalBalance(id: string | number) {
        return this.balances$.pipe(
            map((balances) => balances.find((b) => b.terminal.id === String(id))),
        );
    }
}
