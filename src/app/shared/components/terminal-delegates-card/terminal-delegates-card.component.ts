import startCase from 'lodash-es/startCase';
import { ReplaySubject, combineLatest, defer, of, switchMap } from 'rxjs';
import { map, shareReplay, take } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import {
    Component,
    DestroyRef,
    Injector,
    Input,
    OnChanges,
    inject,
    model,
    runInInjectionContext,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TerminalRef } from '@vality/domain-proto/domain';
import { Column, ComponentChanges, TableModule } from '@vality/matez';
import { getUnionKey } from '@vality/ng-thrift';

import { DomainService, RoutingRulesStoreService } from '~/api/domain-config';
import { PartiesStoreService } from '~/api/payment-processing';
import { createPartyColumn, createPredicateColumn, getPredicateBoolean } from '~/utils';

import { changeCandidatesAllowed } from '../../../parties/party/routing-rules/utils/toggle-candidate-allowed';
import {
    TerminalShopWalletDelegate,
    getTerminalShopWalletDelegates,
} from '../../../terminals/utils/get-terminal-shop-wallet-delegates';
import { SidenavInfoService } from '../sidenav-info';
import { CardComponent } from '../sidenav-info/components/card/card.component';
import { DomainObjectCardComponent } from '../thrift-api-crud/domain';

@Component({
    selector: 'cc-terminal-delegates-card',
    imports: [
        CommonModule,
        CardComponent,
        TableModule,
        MatButtonModule,
        MatTooltipModule,
        MatBadgeModule,
    ],
    templateUrl: './terminal-delegates-card.component.html',
})
export class TerminalDelegatesCardComponent implements OnChanges {
    private partiesStoreService = inject(PartiesStoreService);
    private routingRulesStoreService = inject(RoutingRulesStoreService);
    private domainService = inject(DomainService);
    private sidenavInfoService = inject(SidenavInfoService);
    private injector = inject(Injector);
    private dr = inject(DestroyRef);

    @Input() ref: TerminalRef;

    progress$ = this.routingRulesStoreService.isLoading$;
    columns: Column<TerminalShopWalletDelegate>[] = [
        {
            header: 'Routing Rule',
            field: 'terminalRule.data.name',
            cell: (d) => ({
                description: d.terminalRule.ref.id,
                click: () => {
                    this.sidenavInfoService.toggle(DomainObjectCardComponent, {
                        ref: { routing_rules: { id: d.terminalRule.ref.id } },
                    });
                },
            }),
        },
        {
            header: 'Ruleset',
            field: 'rule.data.name',
            cell: (d) => ({
                description: d.rule.ref.id,
                click: () => {
                    this.sidenavInfoService.toggle(DomainObjectCardComponent, {
                        ref: { routing_rules: { id: d.rule.ref.id } },
                    });
                },
            }),
        },
        createPredicateColumn(
            (d) => ({
                predicate: d.candidates[0].candidate.allowed,
                toggle: () => {
                    changeCandidatesAllowed(
                        d.candidates.map((c) => ({
                            refId: d.terminalRule.ref.id,
                            candidateIdx: c.idx,
                        })),
                    );
                },
            }),
            {
                header: 'Allowed',
            },
        ),
        createPartyColumn((d) => ({ id: d.delegate.allowed.condition?.party?.id })),
        {
            field: 'type',
            cell: (d) => ({
                value: startCase(
                    getUnionKey(d.delegate.allowed.condition?.party?.definition).slice(0, -3),
                ),
            }),
        },
        {
            field: 'definition',
            cell: (d) => {
                const party = d.delegate.allowed.condition?.party;
                switch (getUnionKey(party?.definition)) {
                    case 'shop_is':
                        return this.partiesStoreService
                            .getShop(party?.definition?.shop_is)
                            .value$.pipe(
                                map((shop) => ({
                                    value: shop.data.name,
                                    description: shop.ref.id,
                                    link: () =>
                                        `/parties/${party.id}/routing-rules/payment/${d.rule.ref.id}/delegate/${d.delegate.ruleset.id}`,
                                })),
                            );
                    case 'wallet_is':
                        return this.partiesStoreService
                            .getShop(party?.definition?.wallet_is)
                            .value$.pipe(
                                map((wallet) => ({
                                    value: wallet.data.name,
                                    description: wallet.ref.id,
                                    link: () =>
                                        `/parties/${party.id}/routing-rules/withdrawal/${d.rule.ref.id}/delegate/${d.delegate.ruleset.id}`,
                                })),
                            );
                }
            },
        },
    ];
    terminalObj$ = defer(() => this.ref$).pipe(
        switchMap((ref) => this.domainService.get({ terminal: ref })),
        map((obj) => obj.object),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    rules$ = this.terminalObj$.pipe(
        switchMap((terminalObj) =>
            this.routingRulesStoreService.routingRules$.pipe(
                map((rules) =>
                    terminalObj ? getTerminalShopWalletDelegates(rules, terminalObj.terminal) : [],
                ),
            ),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    selectedRules = model<TerminalShopWalletDelegate[]>();
    toggledRules$ = toObservable(this.selectedRules).pipe(
        switchMap((rules) => (rules?.length ? of(rules) : this.rules$)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    isPredicatesAllowed$ = this.toggledRules$.pipe(
        map((rules) => {
            const allowedBoolean = rules
                .map((r) => r.candidates.map((c) => getPredicateBoolean(c.candidate.allowed)))
                .flat();
            return allowedBoolean.every((a) => a === allowedBoolean[0]) ? allowedBoolean[0] : null;
        }),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    private ref$ = new ReplaySubject<TerminalRef>(1);

    ngOnChanges(changes: ComponentChanges<TerminalDelegatesCardComponent>) {
        if (changes.ref) {
            this.ref$.next(this.ref);
        }
    }

    changeRulesAllowed() {
        combineLatest([this.isPredicatesAllowed$, this.toggledRules$])
            .pipe(take(1), takeUntilDestroyed(this.dr))
            .subscribe(([isPredicatesAllowed, rules]) => {
                runInInjectionContext(this.injector, () => {
                    changeCandidatesAllowed(
                        rules.flatMap((rule) =>
                            rule.candidates.map((candidate) => ({
                                refId: rule.terminalRule.ref.id,
                                candidateIdx: candidate.idx,
                            })),
                        ),
                        !isPredicatesAllowed,
                    );
                });
            });
    }
}
