import { Injectable } from '@angular/core';
import { shareReplay, map } from 'rxjs/operators';

import { TerminalBalanceService } from '../terminal-balance.service';

@Injectable({
    providedIn: 'root',
})
export class TerminalBalancesStoreService {
    balances$ = this.terminalBalanceService.GetTerminalBalances().pipe(
        map((b) => b.balances),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    constructor(private terminalBalanceService: TerminalBalanceService) {}

    getTerminalBalance(id: string | number) {
        return this.balances$.pipe(
            map((balances) => balances.find((b) => b.terminal.id === String(id))),
        );
    }
}
