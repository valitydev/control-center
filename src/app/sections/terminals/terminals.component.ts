import { Component, ViewChild, TemplateRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import {
    TerminalObject,
    ProviderObject,
    RoutingRulesObject,
    RoutingDelegate,
} from '@vality/domain-proto/domain';
import { Column } from '@vality/ng-core';
import startCase from 'lodash-es/startCase';
import { combineLatest } from 'rxjs';
import { startWith, map, debounceTime, tap, take } from 'rxjs/operators';

import { objectToJSON, createFullTextSearch, getUnionValue, getUnionKey } from '../../../utils';
import { DomainStoreService } from '../../api/domain-config';
import { PartiesStoreService } from '../../api/payment-processing';
import { SidenavInfoService } from '../../shared/components/sidenav-info';

@UntilDestroy()
@Component({
    selector: 'cc-terminals',
    templateUrl: './terminals.component.html',
})
export class TerminalsComponent {
    searchControl = new FormControl('');
    columns: Column<TerminalObject>[] = [
        { field: 'ref.id', sortable: true },
        {
            field: 'data.name',
            description: 'data.description',
            sortable: true,
            click: (d) => {
                this.openedTerminal = d;
                this.sidenavInfoService.toggle(
                    this.terminalTpl,
                    d.data.name || d.data.description || `Terminal #${d.ref.id}`,
                    d,
                );
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
                        this.openedProvider = provider;
                        this.sidenavInfoService.toggle(
                            this.providerTpl,
                            provider.data.name ||
                                provider.data.description ||
                                `Provider #${provider.ref.id}`,
                            provider,
                        );
                    });
            },
        },
        {
            field: 'delegates',
            formatter: (d) =>
                this.getTerminalShopWalletDelegates(d).pipe(map((r) => r.length || '')),
            click: (d) => {
                this.getTerminalShopWalletDelegates(d)
                    .pipe(take(1), untilDestroyed(this))
                    .subscribe((rules) => {
                        this.openedRoutingRules = rules;
                        this.sidenavInfoService.toggle(
                            this.routingRulesTpl,
                            `Terminal #${d.ref.id} delegates`,
                            d,
                        );
                    });
            },
        },
    ];
    data$ = combineLatest([
        this.domainStoreService.getObjects('terminal').pipe(
            map((objects) =>
                createFullTextSearch(
                    objects,
                    objects.map((o) => ({
                        ref: o.ref.id,
                        data: JSON.stringify(objectToJSON(o.data)),
                        name: o.data.name,
                        description: o.data.description,
                    })),
                ),
            ),
        ),
        this.searchControl.valueChanges.pipe(
            startWith(this.searchControl.value),
            debounceTime(100),
        ),
    ]).pipe(
        tap(([, search]) => {
            if (search) {
                this.sort = { active: '', direction: '' };
            }
        }),
        map(([fts, search]) => fts.search(search)),
    );
    progress$ = this.domainStoreService.isLoading$;
    sort: Sort = { active: 'data.name', direction: 'asc' };
    openedTerminal?: TerminalObject;
    @ViewChild('terminalTpl') terminalTpl: TemplateRef<unknown>;
    openedProvider?: ProviderObject;
    @ViewChild('providerTpl') providerTpl: TemplateRef<unknown>;
    openedRoutingRules?: {
        delegate: RoutingDelegate;
        rule: RoutingRulesObject;
        terminalRule: RoutingRulesObject;
    }[];
    @ViewChild('routingRulesTpl') routingRulesTpl: TemplateRef<unknown>;

    routingRulesColumns: Column<{
        delegate: RoutingDelegate;
        rule: RoutingRulesObject;
        terminalRule: RoutingRulesObject;
    }>[] = [
        {
            header: 'Routing Rule',
            field: 'terminalRule.data.name',
            description: 'terminalRule.ref.id',
        },
        {
            header: 'Ruleset',
            field: 'rule.data.name',
            description: 'rule.ref.id',
        },
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
                        map((p) =>
                            getUnionKey(d.delegate.allowed.condition?.party?.definition) ===
                            'shop_is'
                                ? p.shops.get(
                                      getUnionValue(
                                          d.delegate.allowed.condition?.party?.definition,
                                      ),
                                  ).details.name
                                : p.wallets.get(
                                      getUnionValue(
                                          d.delegate.allowed.condition?.party?.definition,
                                      ),
                                  ).name,
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

    constructor(
        private domainStoreService: DomainStoreService,
        private router: Router,
        private sidenavInfoService: SidenavInfoService,
        private partiesStoreService: PartiesStoreService,
    ) {}

    update() {
        this.domainStoreService.forceReload();
    }

    create() {
        void this.router.navigate(['/domain/create']);
    }

    private getProvider(terminalObj: TerminalObject) {
        return this.domainStoreService
            .getObjects('provider')
            .pipe(
                map((providers) =>
                    providers.find((p) => p.ref.id === terminalObj.data.provider_ref.id),
                ),
            );
    }

    private getTerminalShopWalletDelegates(terminalObj: TerminalObject) {
        return this.domainStoreService.getObjects('routing_rules').pipe(
            map((rules) => {
                const terminalRules = rules.filter(
                    (r) =>
                        r.data?.decisions?.candidates?.some?.(
                            (c) => c.terminal.id === terminalObj.ref.id,
                        ),
                );
                return terminalRules
                    .map((terminalRule) =>
                        rules.map((rule) =>
                            (
                                rule?.data?.decisions?.delegates?.filter?.(
                                    (d) =>
                                        d?.ruleset?.id === terminalRule.ref.id &&
                                        d?.allowed?.condition?.party &&
                                        ['wallet_is', 'shop_is'].includes(
                                            getUnionKey(d?.allowed?.condition?.party?.definition),
                                        ),
                                ) || []
                            ).map((delegate) => ({ delegate, rule, terminalRule })),
                        ),
                    )
                    .flat(2);
            }),
        );
    }
}
