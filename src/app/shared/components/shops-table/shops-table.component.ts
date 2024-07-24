import { CommonModule } from '@angular/common';
import {
    Component,
    Output,
    EventEmitter,
    Input,
    booleanAttribute,
    OnChanges,
    input,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { Shop, Party, PartyID, RoutingRulesetRef } from '@vality/domain-proto/domain';
import {
    InputFieldModule,
    TableModule,
    Column,
    createOperationColumn,
    DialogService,
    NotifyLogService,
    ConfirmDialogComponent,
    DialogResponseStatus,
    ComponentChanges,
} from '@vality/ng-core';
import { getUnionKey } from '@vality/ng-thrift';
import isNil from 'lodash-es/isNil';
import startCase from 'lodash-es/startCase';
import { map, switchMap, Subject, defer, combineLatest } from 'rxjs';
import { filter, shareReplay, startWith, take, first } from 'rxjs/operators';
import { MemoizeExpiring } from 'typescript-memoize';

import { DomainStoreService } from '../../../api/domain-config';
import { PartyManagementService } from '../../../api/payment-processing';
import { PartyDelegateRulesetsService } from '../../../sections/routing-rules/party-delegate-rulesets';
import { RoutingRulesType } from '../../../sections/routing-rules/types/routing-rules-type';
import { ShopCardComponent } from '../shop-card/shop-card.component';
import { ShopContractCardComponent } from '../shop-contract-card/shop-contract-card.component';
import { SidenavInfoService } from '../sidenav-info';
import {
    DomainThriftViewerComponent,
    DomainObjectCardComponent,
    getDomainObjectDetails,
} from '../thrift-api-crud';

export interface ShopParty {
    shop: Shop;
    party: {
        id: PartyID;
        email: Party['contact_info']['registration_email'];
    };
}

@Component({
    selector: 'cc-shops-table',
    standalone: true,
    imports: [
        CommonModule,
        DomainThriftViewerComponent,
        InputFieldModule,
        MatCardModule,
        TableModule,
    ],
    templateUrl: './shops-table.component.html',
    providers: [PartyDelegateRulesetsService],
})
export class ShopsTableComponent implements OnChanges {
    shops = input<ShopParty[]>([]);
    @Input({ transform: booleanAttribute }) changed!: boolean;
    @Input() progress: number | boolean = false;
    @Output() update = new EventEmitter<void>();
    @Output() filterChange = new EventEmitter<string>();

    @Input({ transform: booleanAttribute }) noSort: boolean = false;
    @Input({ transform: booleanAttribute }) noPartyColumn: boolean = false;

    columns$ = combineLatest([
        toObservable(this.shops).pipe(
            startWith([]),
            map((shops) => (shops ? Array.from(new Set(shops.map((s) => s.party.id))) : [])),
            switchMap((parties) =>
                combineLatest(
                    parties.map((id) =>
                        this.partyDelegateRulesetsService.getDelegatesWithPaymentInstitution(
                            RoutingRulesType.Payment,
                            id,
                        ),
                    ),
                ).pipe(map((rules) => new Map(rules.map((r, idx) => [parties[idx], r])))),
            ),
            map((delegatesWithPaymentInstitutionByParty) => ({
                delegatesWithPaymentInstitutionByParty,
                rulesetIds: Array.from(
                    Array.from(delegatesWithPaymentInstitutionByParty.values()).reduce((acc, d) => {
                        d?.map((v) => v?.partyDelegate?.ruleset?.id).forEach((v) => acc.add(v));
                        return acc;
                    }, new Set<number>([])),
                ),
            })),
        ),
        defer(() => this.updateColumns$).pipe(startWith(null)),
    ]).pipe(
        map(([delegatesByParty]): Column<ShopParty>[] => [
            {
                field: 'shop.id',
                sortable: !this.noSort,
            },
            {
                field: 'shop.details.name',
                description: 'shop.details.description',
                click: (d) => {
                    this.sidenavInfoService.toggle(ShopCardComponent, {
                        partyId: d.party.id,
                        id: d.shop.id,
                    });
                },
                sortable: !this.noSort,
            },
            ...(this.noPartyColumn
                ? []
                : [
                      {
                          field: 'party.email',
                          header: 'Party',
                          description: 'party.id',
                          link: (d) => `/party/${d.party.id}`,
                      },
                  ]),
            {
                field: 'shop.contract_id',
                header: 'Contract',
                click: (d) => {
                    this.sidenavInfoService.toggle(ShopContractCardComponent, {
                        partyId: d.party.id,
                        id: d.shop.id,
                    });
                },
            },
            {
                field: 'terms',
                formatter: (d) =>
                    this.getTerms(d.party.id, d.shop.id).pipe(
                        map((terms) => getDomainObjectDetails(terms).label),
                    ),
                description: (d) =>
                    this.getTerms(d.party.id, d.shop.id).pipe(
                        map((terms) => getDomainObjectDetails(terms).id),
                    ),
                lazy: true,
                click: (d) => {
                    this.getTerms(d.party.id, d.shop.id).subscribe((terms) => {
                        this.sidenavInfoService.toggle(DomainObjectCardComponent, {
                            ref: { term_set_hierarchy: terms.term_set_hierarchy.ref },
                        });
                    });
                },
            },
            {
                field: 'shop.location.url',
            },
            {
                field: 'shop.account.currency.symbolic_code',
                header: 'Currency',
            },
            {
                field: 'shop.blocking',
                type: 'tag',
                formatter: ({ shop }) => getUnionKey(shop.blocking),
                typeParameters: {
                    label: ({ shop }) => startCase(getUnionKey(shop.blocking)),
                    tags: {
                        blocked: { color: 'warn' },
                        unblocked: { color: 'success' },
                    },
                },
            },
            {
                field: 'shop.suspension',
                type: 'tag',
                formatter: ({ shop }) => getUnionKey(shop.suspension),
                typeParameters: {
                    label: ({ shop }) => startCase(getUnionKey(shop.suspension)),
                    tags: {
                        suspended: { color: 'warn' },
                        active: { color: 'success' },
                    },
                },
            },
            createOperationColumn<ShopParty>([
                ...delegatesByParty.rulesetIds.map((id) => ({
                    label: `Routing rules #${id}`,
                    click: ({ shop, party }) =>
                        this.openRoutingRules(
                            delegatesByParty.delegatesWithPaymentInstitutionByParty
                                .get(party.id)
                                .find((d) => d?.partyDelegate?.ruleset?.id === id)?.partyDelegate
                                ?.ruleset?.id,
                            shop.id,
                            party.id,
                        ),
                    disabled: ({ party }) =>
                        isNil(
                            delegatesByParty.delegatesWithPaymentInstitutionByParty
                                .get(party.id)
                                .find((d) => d?.partyDelegate?.ruleset?.id === id)?.partyDelegate
                                ?.ruleset?.id,
                        ),
                })),
                {
                    label: ({ shop }) =>
                        getUnionKey(shop.suspension) === 'suspended' ? 'Activate' : 'Suspend',
                    click: (d) => {
                        this.toggleSuspension(d);
                    },
                },
                {
                    label: ({ shop }) =>
                        getUnionKey(shop.blocking) === 'blocked' ? 'Unblock' : 'Block',
                    click: (d) => {
                        this.toggleBlocking(d);
                    },
                },
            ]),
        ]),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    sort: Sort = { active: 'shop.details.name', direction: 'asc' };
    private updateColumns$ = new Subject<void>();

    constructor(
        private sidenavInfoService: SidenavInfoService,
        private partyManagementService: PartyManagementService,
        private dialogService: DialogService,
        private log: NotifyLogService,
        private router: Router,
        private partyDelegateRulesetsService: PartyDelegateRulesetsService,
        private domainStoreService: DomainStoreService,
    ) {}

    ngOnChanges(changes: ComponentChanges<ShopsTableComponent>) {
        if (changes.noSort || changes.noPartyColumn) {
            if (this.noSort) {
                this.sort = { active: '', direction: '' };
            }
            this.updateColumns$.next();
        }
    }

    toggleBlocking({ party, shop }: ShopParty) {
        this.dialogService
            .open(ConfirmDialogComponent, {
                title: getUnionKey(shop.blocking) === 'unblocked' ? 'Block shop' : 'Unblock shop',
                hasReason: true,
            })
            .afterClosed()
            .pipe(
                filter((r) => r.status === DialogResponseStatus.Success),
                switchMap((r) =>
                    getUnionKey(shop.blocking) === 'unblocked'
                        ? this.partyManagementService.BlockShop(party.id, shop.id, r.data.reason)
                        : this.partyManagementService.UnblockShop(party.id, shop.id, r.data.reason),
                ),
            )
            .subscribe({
                next: () => {
                    this.update.emit();
                    this.log.success();
                },
                error: (err) => {
                    this.log.error(err);
                },
            });
    }

    toggleSuspension({ shop, party }: ShopParty) {
        this.dialogService
            .open(ConfirmDialogComponent, {
                title: getUnionKey(shop.suspension) === 'active' ? 'Suspend shop' : 'Activate shop',
            })
            .afterClosed()
            .pipe(
                filter((r) => r.status === DialogResponseStatus.Success),
                switchMap(() =>
                    getUnionKey(shop.suspension) === 'active'
                        ? this.partyManagementService.SuspendShop(party.id, shop.id)
                        : this.partyManagementService.ActivateShop(party.id, shop.id),
                ),
            )
            .subscribe({
                next: () => {
                    this.update.emit();
                    this.log.success();
                },
                error: (err) => {
                    this.log.error(err);
                },
            });
    }

    @MemoizeExpiring(5 * 60_000, (...args) => JSON.stringify(args))
    getTerms(partyId: string, shopId: string) {
        return this.partyManagementService.GetShopContract(partyId, shopId).pipe(
            map((c) => {
                if (c.contract.adjustments?.length) {
                    return c.contract.adjustments.at(-1).terms.id;
                }
                return c.contract.terms.id;
            }),
            switchMap((id) =>
                this.domainStoreService.getObject({ term_set_hierarchy: { id } }).pipe(first()),
            ),
            shareReplay({ refCount: true, bufferSize: 1 }),
        );
    }

    private openRoutingRules(
        partyDelegateRulesetId: RoutingRulesetRef['id'],
        shopId: string,
        partyId: string,
    ) {
        this.domainStoreService
            .getObjects('routing_rules')
            .pipe(
                take(1),
                map((rules) => rules.find((r) => r.ref.id === partyDelegateRulesetId)),
            )
            .subscribe((ruleset) => {
                const delegates =
                    ruleset.data?.decisions?.delegates?.filter?.(
                        (delegate) =>
                            delegate?.allowed?.condition?.party?.id === partyId &&
                            delegate?.allowed?.condition?.party?.definition?.shop_is === shopId,
                    ) || [];
                const paymentRulesCommands = [
                    '/party',
                    partyId,
                    'routing-rules',
                    'payment',
                    partyDelegateRulesetId,
                ];
                if (delegates.length === 1) {
                    void this.router.navigate([
                        ...paymentRulesCommands,
                        'delegate',
                        delegates[0].ruleset.id,
                    ]);
                    return;
                }
                this.log.success(
                    delegates.length === 0
                        ? 'No routing rules'
                        : `${delegates.length} routing rules`,
                );
                void this.router.navigate(paymentRulesCommands, {
                    queryParams: {
                        routingRulesList: JSON.stringify({
                            filter: shopId,
                            exact: true,
                        }),
                    },
                });
            });
    }
}
