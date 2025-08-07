import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Column, TableModule } from '@vality/matez';
import { AccountBalance } from '@vality/scrooge-proto/account_balance';
import { combineLatest } from 'rxjs';
import { shareReplay, switchMap } from 'rxjs/operators';

import { AccountBalancesStoreService } from '../../../../api/terminal-balance';
import { createCurrencyColumn } from '../../utils';
import { CardComponent } from '../sidenav-info/components/card/card.component';

@Component({
    selector: 'cc-terminal-balances-card',
    imports: [CommonModule, CardComponent, TableModule],
    templateUrl: './terminal-balances-card.component.html',
})
export class TerminalBalancesCardComponent {
    private accountBalancesStoreService = inject(AccountBalancesStoreService);
    terminalId = input<number>();
    providerId = input<number>();
    columns: Column<AccountBalance>[] = [
        { field: 'account_id' },
        createCurrencyColumn((d) => ({ code: d.balance.currency_code, amount: d.balance.amount }), {
            header: 'Balance',
            field: 'balance',
        }),
        { field: 'last_updated', cell: { type: 'datetime' } },
    ];
    balances$ = combineLatest([toObservable(this.terminalId), toObservable(this.providerId)]).pipe(
        switchMap(([terminalId, providerId]) =>
            this.accountBalancesStoreService.getTerminalBalances(terminalId, providerId),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
}
