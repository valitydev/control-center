import { Component } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { TerminalObject } from '@vality/domain-proto/domain';
import { DialogService, Column2 } from '@vality/ng-core';
import { map } from 'rxjs/operators';

import { DomainStoreService } from '../../api/domain-config';
import { AccountBalancesStoreService } from '../../api/terminal-balance';
import { SidenavInfoService } from '../../shared/components/sidenav-info';
import { TerminalDelegatesCardComponent } from '../../shared/components/terminal-delegates-card/terminal-delegates-card.component';
import {
    DomainObjectCardComponent,
    CreateDomainObjectDialogComponent,
    getDomainObjectDetails,
} from '../../shared/components/thrift-api-crud';
import {
    createCurrencyColumn,
    createPredicateColumn,
    createDomainObjectColumn,
} from '../../shared/utils/table2';

import { getTerminalShopWalletDelegates } from './utils/get-terminal-shop-wallet-delegates';

@Component({
    selector: 'cc-terminals',
    templateUrl: './terminals.component.html',
})
export class TerminalsComponent {
    columns: Column2<TerminalObject>[] = [
        { field: 'ref.id', sort: true, sticky: 'start' },
        {
            field: 'data.name',
            cell: (d) => ({
                description: getDomainObjectDetails({ terminal: d }).description,
                click: () => {
                    this.sidenavInfoService.toggle(DomainObjectCardComponent, {
                        ref: { terminal: d.ref },
                    });
                },
            }),
            sort: true,
        },
        createDomainObjectColumn((d) => ({ ref: { provider: d.data.provider_ref } }), {
            header: 'Provider',
        }),
        createPredicateColumn((d) => ({ predicate: d.data.terms?.payments?.global_allow }), {
            header: 'Payments Global Allow',
            sort: true,
        }),
        createPredicateColumn(
            (d) => ({ predicate: d.data.terms?.wallet?.withdrawals?.global_allow }),
            {
                header: 'Withdrawals Global Allow',
                sort: true,
            },
        ),
        {
            field: 'delegates',
            cell: (d) =>
                this.getTerminalShopWalletDelegates(d).pipe(
                    map((r) => ({
                        value: r.length || '',
                        click: () => {
                            this.sidenavInfoService.toggle(TerminalDelegatesCardComponent, {
                                ref: d.ref,
                            });
                        },
                    })),
                ),
            sort: true,
        },
        createCurrencyColumn(
            (d) =>
                this.accountBalancesStoreService
                    .getTerminalBalances(d.ref.id, d.data.provider_ref?.id)
                    .pipe(
                        map((balances) => ({
                            values: balances.map((a) => ({
                                amount: a.balance.amount,
                                code: a.balance.currency_code,
                            })),
                            isSum: true,
                        })),
                    ),
            { header: 'Balances (Summarized)', sort: true },
        ),
        createCurrencyColumn(
            (d) =>
                this.accountBalancesStoreService
                    .getTerminalBalances(d.ref.id, d.data.provider_ref?.id)
                    .pipe(
                        map((balances) => ({
                            values: balances.map((a) => ({
                                amount: a.balance.amount,
                                code: a.balance.currency_code,
                            })),
                        })),
                    ),
            { header: 'Balances', sort: true },
        ),
    ];
    data$ = this.domainStoreService.getObjects('terminal');
    progress$ = this.domainStoreService.isLoading$;
    sort: Sort = { active: 'data.name', direction: 'asc' };

    constructor(
        private domainStoreService: DomainStoreService,
        private sidenavInfoService: SidenavInfoService,
        private dialogService: DialogService,
        private accountBalancesStoreService: AccountBalancesStoreService,
    ) {}

    update() {
        this.domainStoreService.forceReload();
    }

    create() {
        this.dialogService.open(CreateDomainObjectDialogComponent, {
            objectType: 'TerminalObject',
        });
    }

    private getTerminalShopWalletDelegates(terminalObj: TerminalObject) {
        return this.domainStoreService
            .getObjects('routing_rules')
            .pipe(map((rules) => getTerminalShopWalletDelegates(rules, terminalObj)));
    }
}
