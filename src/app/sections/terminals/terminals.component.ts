import { Component } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { TerminalObject } from '@vality/domain-proto/domain';
import { Column } from '@vality/ng-core';
import { of } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { DomainStoreService } from '../../api/domain-config';
import { SidenavInfoService } from '../../shared/components/sidenav-info';
import { TerminalDelegatesCardComponent } from '../../shared/components/terminal-delegates-card/terminal-delegates-card.component';
import { DomainObjectCardComponent } from '../../shared/components/thrift-api-crud';

import { getTerminalShopWalletDelegates } from './utils/get-terminal-shop-wallet-delegates';

@UntilDestroy()
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
                    .pipe(take(1), untilDestroyed(this))
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
        {
            field: 'delegates',
            formatter: (d) =>
                this.getTerminalShopWalletDelegates(d).pipe(map((r) => r.length || '')),
            click: (d) => {
                this.sidenavInfoService.toggle(TerminalDelegatesCardComponent, { ref: d.ref });
            },
        },
    ];
    data$ = this.domainStoreService.getObjects('terminal');
    progress$ = this.domainStoreService.isLoading$;
    sort: Sort = { active: 'data.name', direction: 'asc' };

    constructor(
        private domainStoreService: DomainStoreService,
        private router: Router,
        private sidenavInfoService: SidenavInfoService,
    ) {}

    update() {
        this.domainStoreService.forceReload();
    }

    create() {
        void this.router.navigate(['/domain/create']);
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
