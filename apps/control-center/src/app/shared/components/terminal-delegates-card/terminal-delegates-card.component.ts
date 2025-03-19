import { CommonModule } from '@angular/common';
import { Component, Injector, Input, OnChanges, model, runInInjectionContext } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { TerminalRef } from '@vality/domain-proto/domain';
import { Column, ComponentChanges, NotifyLogService, TableModule } from '@vality/matez';
import { getUnionKey, getUnionValue } from '@vality/ng-thrift';
import startCase from 'lodash-es/startCase';
import { ReplaySubject, defer, of, switchMap } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { DomainStoreService } from '../../../api/domain-config';
import { PartiesStoreService } from '../../../api/payment-processing';
import { getPredicateBoolean } from '../../../sections/routing-rules/utils/get-changed-predicate';
import { changeCandidatesAllowed } from '../../../sections/routing-rules/utils/change-candidates-allowed';
import {
    TerminalShopWalletDelegate,
    getTerminalShopWalletDelegates,
} from '../../../sections/terminals/utils/get-terminal-shop-wallet-delegates';
import { createPartyColumn, createPredicateColumn } from '../../utils';
import { SidenavInfoService } from '../sidenav-info';
import { CardComponent } from '../sidenav-info/components/card/card.component';
import { DomainObjectCardComponent } from '../thrift-api-crud';

@Component({
    selector: 'cc-terminal-delegates-card',
    imports: [CommonModule, CardComponent, TableModule, MatButtonModule],
    templateUrl: './terminal-delegates-card.component.html',
})
export class TerminalDelegatesCardComponent implements OnChanges {
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
            }),
            {
                header: 'Allowed',
                cell: (d) => ({
                    click: () => {
                        if (d.candidates.length > 1) {
                            this.log.error('Cannot toggle allowed for multiple candidates');
                        } else {
                            changeCandidatesAllowed([
                                { refId: d.terminalRule.ref.id, candidateIdx: d.candidates[0].idx },
                            ]);
                        }
                    },
                }),
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
                .pipe(map((rules) => getTerminalShopWalletDelegates(rules, terminalObj.terminal))),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    selectedRules = model<TerminalShopWalletDelegate[]>();
    isPredicatesAllowed$ = toObservable(this.selectedRules).pipe(
        switchMap((rules) => (rules?.length ? of(rules) : this.rules$)),
        map((rules) => {
            const allowedBoolean = rules.map((r) =>
                getPredicateBoolean(r.candidates[0].candidate.allowed),
            );
            return allowedBoolean.every((a) => a === allowedBoolean[0]) ? allowedBoolean[0] : null;
        }),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    private ref$ = new ReplaySubject<TerminalRef>(1);

    constructor(
        private partiesStoreService: PartiesStoreService,
        private domainStoreService: DomainStoreService,
        private sidenavInfoService: SidenavInfoService,
        private log: NotifyLogService,
        private injector: Injector,
    ) {}

    ngOnChanges(changes: ComponentChanges<TerminalDelegatesCardComponent>) {
        if (changes.ref) {
            this.ref$.next(this.ref);
        }
    }

    changeRulesAllowed(rules: TerminalShopWalletDelegate[], isAllowed: boolean) {
        runInInjectionContext(this.injector, () => {
            changeCandidatesAllowed(
                rules.flatMap((rule) =>
                    rule.candidates.map((candidate) => ({
                        refId: rule.terminalRule.ref.id,
                        candidateIdx: candidate.idx,
                    })),
                ),
                isAllowed,
            );
        });
    }
}
