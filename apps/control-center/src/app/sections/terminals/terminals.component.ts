import { Component } from '@angular/core';
import { TerminalObject } from '@vality/domain-proto/domain';
import { Column, DialogService } from '@vality/matez';
import { map } from 'rxjs/operators';

import { DomainStoreService } from '../../api/domain-config';
import { AccountBalancesStoreService } from '../../api/terminal-balance';
import {
    createCurrencyColumn,
    createDomainObjectColumn,
    createPredicateColumn,
} from '../../shared';
import { SidenavInfoService } from '../../shared/components/sidenav-info';
import { TerminalBalancesCardComponent } from '../../shared/components/terminal-balances-card/terminal-balances-card.component';
import { TerminalDelegatesCardComponent } from '../../shared/components/terminal-delegates-card/terminal-delegates-card.component';
import {
    CreateDomainObjectDialogComponent,
    DomainObjectCardComponent,
    getDomainObjectDetails,
} from '../../shared/components/thrift-api-crud';

import { getTerminalShopWalletDelegates } from './utils/get-terminal-shop-wallet-delegates';

@Component({
    selector: 'cc-terminals',
    templateUrl: './terminals.component.html',
    standalone: false,
})
export class TerminalsComponent {
    columns: Column<TerminalObject>[] = [
        { field: 'ref.id', sticky: 'start' },
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
        },
        createDomainObjectColumn((d) => ({ ref: { provider: d.data.provider_ref } }), {
            header: 'Provider',
        }),
        createPredicateColumn((d) => ({ predicate: d.data.terms?.payments?.global_allow }), {
            header: 'Payments Global Allow',
        }),
        createPredicateColumn(
            (d) => ({ predicate: d.data.terms?.wallet?.withdrawals?.global_allow }),
            {
                header: 'Withdrawals Global Allow',
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
            {
                header: 'Balances (Summarized)',
                cell: (d) => ({
                    click: () => {
                        this.toggleBalancesCard(d);
                    },
                }),
            },
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
            {
                header: 'Balances',
                cell: (d) => ({
                    click: () => {
                        this.toggleBalancesCard(d);
                    },
                }),
            },
        ),
    ];
    data$ = this.domainStoreService.getObjects('terminal');
    progress$ = this.domainStoreService.isLoading$;

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

    private toggleBalancesCard(d: TerminalObject) {
        this.sidenavInfoService.toggle(TerminalBalancesCardComponent, {
            terminalId: d.ref.id,
            providerId: d.data.provider_ref.id,
        });
    }
}
