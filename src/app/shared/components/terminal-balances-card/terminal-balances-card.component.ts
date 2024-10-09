import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Sort } from '@angular/material/sort';
import { TableModule, Column2 } from '@vality/ng-core';
import { AccountBalance } from '@vality/scrooge-proto/internal/account_balance';
import { combineLatest } from 'rxjs';
import { switchMap, shareReplay } from 'rxjs/operators';

import { AccountBalancesStoreService } from '../../../api/terminal-balance';
import { createCurrencyColumn } from '../../utils/table2';
import { CardComponent } from '../sidenav-info/components/card/card.component';
import { DomainThriftViewerComponent } from '../thrift-api-crud';

@Component({
    selector: 'cc-terminal-balances-card',
    standalone: true,
    imports: [CommonModule, CardComponent, DomainThriftViewerComponent, TableModule],
    templateUrl: './terminal-balances-card.component.html',
})
export class TerminalBalancesCardComponent {
    terminalId = input<number>();
    providerId = input<number>();
    columns: Column2<AccountBalance>[] = [
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
    sort: Sort = { active: 'account_id', direction: 'asc' };

    constructor(private accountBalancesStoreService: AccountBalancesStoreService) {}
}
