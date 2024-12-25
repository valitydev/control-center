import { CommonModule } from '@angular/common';
import {
    Component,
    Output,
    EventEmitter,
    Input,
    booleanAttribute,
    input,
    Injector,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { Shop, Party, PartyID, RoutingRulesetRef } from '@vality/domain-proto/domain';
import {
    InputFieldModule,
    TableModule,
    DialogService,
    NotifyLogService,
    ConfirmDialogComponent,
    DialogResponseStatus,
    Column,
    createMenuColumn,
} from '@vality/matez';
import { getUnionKey } from '@vality/ng-thrift';
import { isNil } from 'lodash-es';
import startCase from 'lodash-es/startCase';
import { map, switchMap, combineLatest, of } from 'rxjs';
import { filter, shareReplay, startWith, take, first } from 'rxjs/operators';
import { MemoizeExpiring } from 'typescript-memoize';

import { createPartyColumn } from '@cc/app/shared';

import { DomainStoreService } from '../../../api/domain-config';
import { PartyManagementService } from '../../../api/payment-processing';
import {
    PartyDelegateRulesetsService,
    DelegateWithPaymentInstitution,
} from '../../../sections/routing-rules/party-delegate-rulesets';
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
export class ShopsTableComponent {
    shops = input<ShopParty[]>([]);
    @Input() progress: number | boolean = false;
    @Output() update = new EventEmitter<void>();
    @Output() filterChange = new EventEmitter<string>();

    noPartyColumn = input(false, { transform: booleanAttribute });

    columns: Column<ShopParty>[] = [
        {
            field: 'shop.id',
        },
        {
            field: 'shop.details.name',
            cell: (d) => ({
                description: d.shop.details.description,
                click: () => {
                    this.sidenavInfoService.toggle(ShopCardComponent, {
                        partyId: d.party.id,
                        id: d.shop.id,
                    });
                },
            }),
        },
        createPartyColumn(
            (d) => ({
                id: d.party.id,
                partyName: d.party.email,
            }),
            {
                hidden: toObservable(this.noPartyColumn),
            },
        ),
        {
            field: 'shop.contract_id',
            header: 'Contract',
            cell: (d) => ({
                click: () => {
                    this.sidenavInfoService.toggle(ShopContractCardComponent, {
                        partyId: d.party.id,
                        id: d.shop.id,
                    });
                },
            }),
        },
        {
            field: 'terms',
            lazyCell: (d) =>
                this.getTerms(d.party.id, d.shop.id).pipe(
                    map((terms) => getDomainObjectDetails(terms)),
                    map((details) => ({
                        value: details.label,
                        description: details.description,
                        click: () => {
                            this.getTerms(d.party.id, d.shop.id).subscribe((terms) => {
                                this.sidenavInfoService.toggle(DomainObjectCardComponent, {
                                    ref: {
                                        term_set_hierarchy: terms.term_set_hierarchy.ref,
                                    },
                                });
                            });
                        },
                    })),
                ),
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
            cell: (d) => ({
                value: startCase(getUnionKey(d.shop.blocking)),
                color: (
                    {
                        blocked: 'warn',
                        unblocked: 'success',
                    } as const
                )[getUnionKey(d.shop.blocking)],
            }),
        },
        {
            field: 'shop.suspension',
            cell: (d) => ({
                value: startCase(getUnionKey(d.shop.suspension)),
                color: (
                    {
                        suspended: 'warn',
                        active: 'success',
                    } as const
                )[getUnionKey(d.shop.suspension)],
            }),
        },
        createMenuColumn((d) =>
            this.getDelegatesByParty().pipe(
                map((delegatesByParty) => ({
                    items: [
                        ...delegatesByParty.rulesetIds.map((id) => {
                            const rulesetId =
                                delegatesByParty.delegatesWithPaymentInstitutionByParty
                                    ?.get?.(d.party.id)
                                    ?.find?.((v) => v?.partyDelegate?.ruleset?.id === id)
                                    ?.partyDelegate?.ruleset?.id;
                            return {
                                label: `Routing rules #${id}`,
                                click: () =>
                                    this.openRoutingRules(rulesetId, d.shop.id, d.party.id),
                                disabled: isNil(rulesetId),
                            };
                        }),
                        {
                            label:
                                getUnionKey(d.shop.suspension) === 'suspended'
                                    ? 'Activate'
                                    : 'Suspend',
                            click: () => {
                                this.toggleSuspension(d);
                            },
                        },
                        {
                            label: getUnionKey(d.shop.blocking) === 'blocked' ? 'Unblock' : 'Block',
                            click: () => {
                                this.toggleBlocking(d);
                            },
                        },
                    ],
                })),
            ),
        ),
    ];

    constructor(
        private sidenavInfoService: SidenavInfoService,
        private partyManagementService: PartyManagementService,
        private dialogService: DialogService,
        private log: NotifyLogService,
        private router: Router,
        private partyDelegateRulesetsService: PartyDelegateRulesetsService,
        private domainStoreService: DomainStoreService,
        private injector: Injector,
    ) {}

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

    private getDelegatesByParty() {
        return toObservable(this.shops, { injector: this.injector }).pipe(
            startWith(null),
            map((shops) =>
                shops?.length ? Array.from(new Set(shops.map((s) => s.party.id))) : [],
            ),
            switchMap((parties) =>
                parties?.length
                    ? combineLatest(
                          parties.map((id) =>
                              this.partyDelegateRulesetsService.getDelegatesWithPaymentInstitution(
                                  RoutingRulesType.Payment,
                                  id,
                              ),
                          ),
                      ).pipe(map((rules) => new Map(rules.map((r, idx) => [parties[idx], r]))))
                    : of(new Map<string, DelegateWithPaymentInstitution[]>()),
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
        );
    }
}
