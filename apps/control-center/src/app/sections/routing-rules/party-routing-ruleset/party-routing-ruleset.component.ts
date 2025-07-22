import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { RoutingDelegate } from '@vality/domain-proto/domain';
import { Column, DialogResponseStatus, DialogService, compareDifferentTypes } from '@vality/matez';
import { combineLatest } from 'rxjs';
import { filter, map, shareReplay, startWith, switchMap, take } from 'rxjs/operators';

import { RoutingRulesStoreService } from '../../../api/domain-config';
import { createShopColumn, createWalletColumn } from '../../../shared';
import { SidenavInfoService } from '../../../shared/components/sidenav-info';
import { DomainObjectCardComponent } from '../../../shared/components/thrift-api-crud/domain2';
import { RoutingRulesListItem } from '../components/routing-rules-list';
import { PartyDelegateRulesetsService } from '../party-delegate-rulesets';
import { RoutingRulesTypeService } from '../routing-rules-type.service';

import { AddPartyRoutingRuleDialogComponent } from './add-party-routing-rule-dialog';
import { InitializeRoutingRulesDialogComponent } from './initialize-routing-rules-dialog';
import { PartyRoutingRulesetService } from './party-routing-ruleset.service';

@Component({
    selector: 'cc-party-routing-ruleset',
    templateUrl: 'party-routing-ruleset.component.html',
    styleUrls: ['party-routing-ruleset.component.scss'],
    providers: [PartyRoutingRulesetService, RoutingRulesTypeService, PartyDelegateRulesetsService],
    standalone: false,
})
export class PartyRoutingRulesetComponent {
    private dialogService = inject(DialogService);
    private partyRoutingRulesetService = inject(PartyRoutingRulesetService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private routingRulesStoreService = inject(RoutingRulesStoreService);
    private destroyRef = inject(DestroyRef);
    private sidenavInfoService = inject(SidenavInfoService);
    protected routingRulesTypeService = inject(RoutingRulesTypeService);

    partyRuleset$ = this.partyRoutingRulesetService.partyRuleset$;
    partyID$ = this.partyRoutingRulesetService.partyID$;
    isLoading$ = this.routingRulesStoreService.isLoading$;

    shopsDisplayedColumns: Column<RoutingRulesListItem<RoutingDelegate>>[] = [
        {
            field: 'id',
            header: 'Delegate (Ruleset Ref ID)',
            cell: (d) => ({
                value: d.item?.description || `#${d.item?.ruleset?.id}`,
                description: d.item?.ruleset?.id,
                click: () => this.navigateToDelegate(d.parentRefId, d.delegateIdx),
            }),
        },
        createShopColumn((d) =>
            this.partyRoutingRulesetService.partyID$.pipe(
                map((partyId) => ({
                    shopId: d.item?.allowed?.condition?.party?.definition?.shop_is,
                    partyId,
                })),
            ),
        ),
    ];
    walletsDisplayedColumns: Column<RoutingRulesListItem<RoutingDelegate>>[] = [
        {
            field: 'id',
            header: 'Delegate (Ruleset Ref ID)',
            cell: (d) => ({
                value: d.item?.description || `#${d.item?.ruleset?.id}`,
                description: d.item?.ruleset?.id,
                click: () => this.navigateToDelegate(d.parentRefId, d.delegateIdx),
            }),
        },
        createWalletColumn((d) =>
            this.partyRoutingRulesetService.partyID$.pipe(
                map((partyId) => ({
                    id: d.item?.allowed?.condition?.party?.definition?.wallet_is,
                    partyId,
                })),
            ),
        ),
    ];
    shopsData$ = this.partyRuleset$.pipe(
        filter(Boolean),
        map((ruleset): RoutingRulesListItem<RoutingDelegate>[] =>
            ruleset.data.decisions.delegates
                .filter((d) => d?.allowed?.condition?.party?.definition?.shop_is)
                .map((delegate, delegateIdx) => ({
                    parentRefId: ruleset.ref.id,
                    delegateIdx,
                    item: delegate,
                })),
        ),
        startWith([]),
        takeUntilDestroyed(this.destroyRef),
        shareReplay(1),
    );
    walletsData$ = this.partyRuleset$.pipe(
        filter(Boolean),
        map((ruleset): RoutingRulesListItem<RoutingDelegate>[] =>
            ruleset.data.decisions.delegates
                .filter((d) => d?.allowed?.condition?.party?.definition?.wallet_is)
                .map((delegate, delegateIdx) => ({
                    parentRefId: ruleset.ref.id,
                    delegateIdx,
                    item: delegate,
                })),
        ),
        startWith([]),
        takeUntilDestroyed(this.destroyRef),
        shareReplay(1),
    );

    add() {
        this.partyRuleset$.pipe(take(1)).subscribe((partyRuleset) => {
            if (partyRuleset) {
                this.addPartyRule();
            } else {
                this.initialize();
            }
        });
    }

    navigateToDelegate(parentRefId: number, delegateIdx: number) {
        this.partyRoutingRulesetService.partyRuleset$
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe((ruleset) =>
                this.router.navigate([
                    'party',
                    this.route.snapshot.params['partyID'],
                    'routing-rules',
                    this.route.snapshot.params['type'],
                    parentRefId,
                    'delegate',
                    ruleset?.data?.decisions?.delegates?.[delegateIdx]?.ruleset?.id,
                ]),
            );
    }

    openRefId() {
        this.partyRuleset$.pipe(take(1), filter(Boolean)).subscribe(({ ref }) => {
            this.sidenavInfoService.toggle(DomainObjectCardComponent, {
                ref: { routing_rules: { id: Number(ref.id) } },
            });
        });
    }

    private initialize() {
        combineLatest([
            this.partyRoutingRulesetService.partyID$,
            this.partyRoutingRulesetService.refID$,
        ])
            .pipe(
                take(1),
                switchMap(([partyID, refID]) =>
                    this.dialogService
                        .open(InitializeRoutingRulesDialogComponent, { partyID, refID })
                        .afterClosed(),
                ),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: () => {
                    this.partyRoutingRulesetService.reload();
                },
            });
    }

    private addPartyRule() {
        combineLatest([
            this.partyRoutingRulesetService.refID$,
            this.partyRoutingRulesetService.shops$,
            this.partyRoutingRulesetService.wallets$,
            this.routingRulesTypeService.routingRulesType$,
            this.partyRoutingRulesetService.partyID$,
            this.partyRuleset$,
        ])
            .pipe(
                take(1),
                switchMap(([refID, shops, wallets, type, partyID, ruleset]) => {
                    return this.dialogService
                        .open(AddPartyRoutingRuleDialogComponent, {
                            refID,
                            shops: shops
                                .filter((s) =>
                                    ruleset.data.decisions.delegates.every(
                                        (d) =>
                                            d?.allowed?.condition?.party?.definition?.shop_is !==
                                            s.id,
                                    ),
                                )
                                .sort((a, b) =>
                                    compareDifferentTypes(a.details.name, b.details.name),
                                ),
                            wallets: wallets
                                .filter((w) =>
                                    ruleset.data.decisions.delegates.every(
                                        (d) =>
                                            d?.allowed?.condition?.party?.definition?.wallet_is !==
                                            w.id,
                                    ),
                                )
                                .sort((a, b) => compareDifferentTypes(a.name, b.name)),
                            type,
                            partyID,
                        })
                        .afterClosed();
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: (res) => {
                    if (res.status === DialogResponseStatus.Success) {
                        this.partyRoutingRulesetService.reload();
                    }
                },
            });
    }
}
