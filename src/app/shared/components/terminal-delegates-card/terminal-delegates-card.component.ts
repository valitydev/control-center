import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { TerminalRef } from '@vality/domain-proto/domain';
import { ComponentChanges, TableModule, Column } from '@vality/ng-core';
import { getUnionKey, getUnionValue } from '@vality/ng-thrift';
import startCase from 'lodash-es/startCase';
import { ReplaySubject, defer, switchMap } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { DomainStoreService } from '../../../api/domain-config';
import { PartiesStoreService } from '../../../api/payment-processing';
import {
    getTerminalShopWalletDelegates,
    TerminalShopWalletDelegate,
} from '../../../sections/terminals/utils/get-terminal-shop-wallet-delegates';
import { createPredicateColumn } from '../../utils';
import { SidenavInfoService } from '../sidenav-info';
import { CardComponent } from '../sidenav-info/components/card/card.component';
import { DomainThriftViewerComponent, DomainObjectCardComponent } from '../thrift-api-crud';

@Component({
    selector: 'cc-terminal-delegates-card',
    standalone: true,
    imports: [CommonModule, CardComponent, DomainThriftViewerComponent, TableModule],
    templateUrl: './terminal-delegates-card.component.html',
})
export class TerminalDelegatesCardComponent implements OnChanges {
    @Input() ref: TerminalRef;

    progress$ = this.domainStoreService.isLoading$;
    columns: Column<TerminalShopWalletDelegate>[] = [
        {
            header: 'Routing Rule',
            field: 'terminalRule.data.name',
            description: 'terminalRule.ref.id',
            click: (d) => {
                this.sidenavInfoService.toggle(DomainObjectCardComponent, {
                    ref: { routing_rules: { id: d.terminalRule.ref.id } },
                });
            },
        },
        {
            header: 'Ruleset',
            field: 'rule.data.name',
            description: 'rule.ref.id',
            click: (d) => {
                this.sidenavInfoService.toggle(DomainObjectCardComponent, {
                    ref: { routing_rules: { id: d.rule.ref.id } },
                });
            },
        },
        createPredicateColumn('allowed', (d) => d.candidates[0].allowed),
        {
            field: 'party',
            formatter: (d) =>
                this.partiesStoreService
                    .get(d.delegate.allowed.condition?.party?.id)
                    .pipe(map((p) => p.contact_info.email)),
            description: (d) => d.delegate.allowed.condition?.party?.id,
            link: (d) => `/party/${d.delegate.allowed.condition.party.id}`,
        },
        {
            field: 'type',
            formatter: (d) =>
                startCase(
                    getUnionKey(d.delegate.allowed.condition?.party?.definition).slice(0, -3),
                ),
        },
        {
            field: 'definition',
            formatter: (d) =>
                this.partiesStoreService
                    .get(d.delegate.allowed.condition?.party?.id)
                    .pipe(
                        map(
                            (p) =>
                                (getUnionKey(d.delegate.allowed.condition?.party?.definition) ===
                                'shop_is'
                                    ? p.shops.get(
                                          getUnionValue(
                                              d.delegate.allowed.condition?.party?.definition,
                                          ),
                                      )?.details?.name
                                    : p.wallets.get(
                                          getUnionValue(
                                              d.delegate.allowed.condition?.party?.definition,
                                          ),
                                      )?.name) ??
                                `#${getUnionValue(
                                    d.delegate.allowed.condition?.party?.definition,
                                )}`,
                        ),
                    ),
            description: (d) => getUnionValue(d.delegate.allowed.condition?.party?.definition),
            link: (d) =>
                `/party/${d.delegate.allowed.condition.party.id}/routing-rules/${
                    getUnionKey(d.delegate.allowed.condition?.party?.definition) === 'shop_is'
                        ? 'payment'
                        : 'withdrawal'
                }/${d.rule.ref.id}/delegate/${d.delegate.ruleset.id}`,
        },
    ];
    terminalObj$ = defer(() => this.ref$).pipe(
        switchMap((ref) => this.domainStoreService.getObject({ terminal: ref })),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    rules$ = this.terminalObj$.pipe(
        switchMap((terminalObj) =>
            this.domainStoreService
                .getObjects('routing_rules')
                .pipe(map((rules) => getTerminalShopWalletDelegates(rules, terminalObj.terminal))),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    private ref$ = new ReplaySubject<TerminalRef>(1);

    constructor(
        private partiesStoreService: PartiesStoreService,
        private domainStoreService: DomainStoreService,
        private sidenavInfoService: SidenavInfoService,
    ) {}

    ngOnChanges(changes: ComponentChanges<TerminalDelegatesCardComponent>) {
        if (changes.ref) {
            this.ref$.next(this.ref);
        }
    }
}
