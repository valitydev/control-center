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
import { Column, ComponentChanges, NotifyLogService, TableModule } from '@vality/matez';
import { getUnionKey, getUnionValue } from '@vality/ng-thrift';
import startCase from 'lodash-es/startCase';
import { ReplaySubject, combineLatest, defer, of, switchMap } from 'rxjs';
import { map, shareReplay, take } from 'rxjs/operators';

import { DomainStoreService } from '../../../api/domain-config';
import { PartiesStoreService } from '../../../api/payment-processing';
import { changeCandidatesAllowed } from '../../../sections/routing-rules/utils/toggle-candidate-allowed';
import {
    TerminalShopWalletDelegate,
    getTerminalShopWalletDelegates,
} from '../../../sections/terminals/utils/get-terminal-shop-wallet-delegates';
import { createPartyColumn, createPredicateColumn, getPredicateBoolean } from '../../utils';
import { SidenavInfoService } from '../sidenav-info';
import { CardComponent } from '../sidenav-info/components/card/card.component';
import { DomainObjectCardComponent } from '../thrift-api-crud';

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
    private domainStoreService = inject(DomainStoreService);
    private sidenavInfoService = inject(SidenavInfoService);
    private injector = inject(Injector);
    private log = inject(NotifyLogService);
    private dr = inject(DestroyRef);
    @Input() ref: TerminalRef;

    progress$ = this.domainStoreService.isLoading$;
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
            cell: (d) =>
                this.partiesStoreService.get(d.delegate.allowed.condition?.party?.id).pipe(
                    map((p) => ({
                        value:
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
                            `#${getUnionValue(d.delegate.allowed.condition?.party?.definition)}`,

                        description: getUnionValue(d.delegate.allowed.condition?.party?.definition),
                        link: () =>
                            `/party/${d.delegate.allowed.condition.party.id}/routing-rules/${
                                getUnionKey(d.delegate.allowed.condition?.party?.definition) ===
                                'shop_is'
                                    ? 'payment'
                                    : 'withdrawal'
                            }/${d.rule.ref.id}/delegate/${d.delegate.ruleset.id}`,
                    })),
                ),
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
                .pipe(
                    map((rules) =>
                        terminalObj
                            ? getTerminalShopWalletDelegates(rules, terminalObj.terminal)
                            : [],
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
