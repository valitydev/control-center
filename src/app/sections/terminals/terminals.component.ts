import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Sort } from '@angular/material/sort';
import { TerminalObject } from '@vality/domain-proto/domain';
import { DialogService, Column2 } from '@vality/ng-core';
import { of } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { DomainStoreService } from '../../api/domain-config';
import { AccountBalancesStoreService } from '../../api/terminal-balance';
import { SidenavInfoService } from '../../shared/components/sidenav-info';
import { TerminalDelegatesCardComponent } from '../../shared/components/terminal-delegates-card/terminal-delegates-card.component';
import {
    DomainObjectCardComponent,
    CreateDomainObjectDialogComponent,
} from '../../shared/components/thrift-api-crud';
import { createPredicateColumn, createCurrencyColumn } from '../../shared/utils/table2';

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
                description: d.data.description,
                click: () => {
                    this.sidenavInfoService.toggle(DomainObjectCardComponent, {
                        ref: { terminal: d.ref },
                    });
                },
            }),
            sort: true,
        },
        {
            field: 'data.provider_ref.id',
            header: 'Provider',
            cell: (d) =>
                this.getProvider(d).pipe(
                    map((p) => ({
                        value: p?.data?.name || '',
                        description: d.data.provider_ref?.id,
                        click: () => {
                            this.getProvider(d)
                                .pipe(take(1), takeUntilDestroyed(this.destroyRef))
                                .subscribe((provider) => {
                                    if (!provider) {
                                        return;
                                    }
                                    this.sidenavInfoService.toggle(DomainObjectCardComponent, {
                                        ref: { provider: provider.ref },
                                    });
                                });
                        },
                    })),
                ),
            sort: true,
        },
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
                        map((b) => {
                            const res = b
                                .map((a) => ({
                                    amount: a.balance.amount,
                                    code: a.balance.currency_code,
                                }))
                                .sort((a, b) => b.amount - a.amount);
                            return {
                                ...res[0],
                                other: res.slice(1),
                            };
                        }),
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
        private destroyRef: DestroyRef,
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

    private getProvider(terminalObj: TerminalObject) {
        return terminalObj.data.provider_ref
            ? this.domainStoreService
                  .getObjects('provider')
                  .pipe(
                      map((providers) =>
                          providers.find((p) => p.ref.id === terminalObj.data.provider_ref.id),
                      ),
                  )
            : of(null);
    }

    private getTerminalShopWalletDelegates(terminalObj: TerminalObject) {
        return this.domainStoreService
            .getObjects('routing_rules')
            .pipe(map((rules) => getTerminalShopWalletDelegates(rules, terminalObj)));
    }
}
