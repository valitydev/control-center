import { Component, ViewChild, TemplateRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { TerminalObject, ProviderObject, RoutingRulesObject } from '@vality/domain-proto/domain';
import { Column } from '@vality/ng-core';
import { combineLatest } from 'rxjs';
import { startWith, map, debounceTime, tap, take } from 'rxjs/operators';

import { objectToJSON, createFullTextSearch } from '../../../utils';
import { DomainStoreService } from '../../api/deprecated-damsel';
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
            formatter: (d) =>
                d.data.provider_ref
                    ? this.domainStoreService
                          .getObjects('provider')
                          .pipe(
                              map(
                                  (providers) =>
                                      providers.find((p) => p.ref.id === d.data.provider_ref.id)
                                          ?.data?.name,
                              ),
                          )
                    : '',
            sortable: true,
            click: (d) => {
                if (!d.data.provider_ref) {
                    return;
                }
                this.domainStoreService
                    .getObjects('provider')
                    .pipe(
                        map((providers) =>
                            providers.find((p) => p.ref.id === d.data.provider_ref.id),
                        ),
                        take(1),
                        untilDestroyed(this),
                    )
                    .subscribe((provider) => {
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
            field: 'routing_rules',
            formatter: (d) =>
                this.domainStoreService
                    .getObjects('routing_rules')
                    .pipe(
                        map(
                            (rules) =>
                                rules.filter(
                                    (r) =>
                                        r.data?.decisions?.candidates?.some?.(
                                            (c) => c.terminal.id === d.ref.id,
                                        ),
                                ).length || '',
                        ),
                    ),
            click: (d) => {
                this.domainStoreService
                    .getObjects('routing_rules')
                    .pipe(
                        map((rules) =>
                            rules.filter(
                                (r) =>
                                    r.data?.decisions?.candidates?.some?.(
                                        (c) => c.terminal.id === d.ref.id,
                                    ),
                            ),
                        ),
                        take(1),
                        untilDestroyed(this),
                    )
                    .subscribe((rules) => {
                        if (!rules.length) {
                            return;
                        }
                        this.openedRoutingRules = rules;
                        this.sidenavInfoService.toggle(
                            this.routingRulesTpl,
                            `Terminal #${d.ref.id} routing rules`,
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
    openedRoutingRules?: RoutingRulesObject[];
    @ViewChild('routingRulesTpl') routingRulesTpl: TemplateRef<unknown>;

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
}
