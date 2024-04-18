import { Component, DestroyRef, isDevMode } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Sort } from '@angular/material/sort';
import { TerminalObject } from '@vality/domain-proto/domain';
import { Column, DialogService } from '@vality/ng-core';
import { of } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { DomainStoreService } from '../../api/domain-config';
import { AccountBalancesStoreService } from '../../api/terminal-balance';
import { createPredicateColumn, createCurrencyColumn } from '../../shared';
import { SidenavInfoService } from '../../shared/components/sidenav-info';
import { TerminalDelegatesCardComponent } from '../../shared/components/terminal-delegates-card/terminal-delegates-card.component';
import {
    DomainObjectCardComponent,
    CreateDomainObjectDialogComponent,
} from '../../shared/components/thrift-api-crud';

import { getTerminalShopWalletDelegates } from './utils/get-terminal-shop-wallet-delegates';

@Component({
    selector: 'cc-terminals',
    templateUrl: './terminals.component.html',
})
export class TerminalsComponent {
    columns: Column<TerminalObject>[] = [
        { field: 'ref.id', sortable: true },
        {
            field: 'data.name',
            description: 'data.description',
            sortable: true,
            click: (d) => {
                this.sidenavInfoService.toggle(DomainObjectCardComponent, {
                    ref: { terminal: d.ref },
                });
            },
        },
        {
            field: 'data.provider_ref.id',
            description: 'data.provider_ref.id',
            header: 'Provider',
            formatter: (d) => this.getProvider(d).pipe(map((p) => p?.data?.name || '')),
            sortable: true,
            click: (d) => {
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
        },
        createPredicateColumn('payments global allow', (d) => d.data.terms?.payments?.global_allow),
        createPredicateColumn(
            'withdrawals global allow',
            (d) => d.data.terms?.wallet?.withdrawals?.global_allow,
        ),
        {
            field: 'delegates',
            formatter: (d) =>
                this.getTerminalShopWalletDelegates(d).pipe(map((r) => r.length || '')),
            click: (d) => {
                this.sidenavInfoService.toggle(TerminalDelegatesCardComponent, {
                    ref: d.ref,
                });
            },
        },
        ...(isDevMode()
            ? [
                  createCurrencyColumn<TerminalObject>(
                      'balance',
                      (d) =>
                          this.accountBalancesStoreService
                              .getTerminalBalances(d.ref.id)
                              .pipe(map((b) => b?.[0]?.balance?.amount)),
                      (d) =>
                          this.accountBalancesStoreService
                              .getTerminalBalances(d.ref.id)
                              .pipe(map((b) => b?.[0]?.balance?.currency_code)),
                      { sortable: true },
                  ),
              ]
            : []),
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
