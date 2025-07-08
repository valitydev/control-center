import {
    Component,
    EventEmitter,
    Injector,
    Input,
    Output,
    booleanAttribute,
    inject,
    input,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { RoutingRulesetRef, ShopConfig } from '@vality/domain-proto/domain';
import { PartyManagement } from '@vality/domain-proto/payment_processing';
import {
    Column,
    ConfirmDialogComponent,
    DialogResponseStatus,
    DialogService,
    InputFieldModule,
    NotifyLogService,
    TableModule,
    UpdateOptions,
    createMenuColumn,
} from '@vality/matez';
import { getUnionKey } from '@vality/ng-thrift';
import { isNil } from 'lodash-es';
import startCase from 'lodash-es/startCase';
import { combineLatest, map, of, switchMap } from 'rxjs';
import { filter, startWith, take } from 'rxjs/operators';

import { DomainObjectsStoreService } from '../../../api/domain-config';
import {
    DelegateWithPaymentInstitution,
    PartyDelegateRulesetsService,
} from '../../../sections/routing-rules/party-delegate-rulesets';
import { RoutingRulesType } from '../../../sections/routing-rules/types/routing-rules-type';
import { createPartyColumn } from '../../utils';
import { ShopCardComponent } from '../shop-card/shop-card.component';
import { SidenavInfoService } from '../sidenav-info';
import { DomainObjectCardComponent } from '../thrift-api-crud/domain2';

@Component({
    selector: 'cc-shops-table',
    imports: [InputFieldModule, MatCardModule, TableModule],
    templateUrl: './shops-table.component.html',
    providers: [PartyDelegateRulesetsService],
})
export class ShopsTableComponent {
    private sidenavInfoService = inject(SidenavInfoService);
    private partyManagementService = inject(PartyManagement);
    private dialogService = inject(DialogService);
    private log = inject(NotifyLogService);
    private router = inject(Router);
    private partyDelegateRulesetsService = inject(PartyDelegateRulesetsService);
    private domainStoreService = inject(DomainObjectsStoreService);
    private injector = inject(Injector);

    shops = input<ShopConfig[]>([]);
    @Input() progress: number | boolean = false;
    @Output() update = new EventEmitter<UpdateOptions>();
    @Output() filterChange = new EventEmitter<string>();

    noPartyColumn = input(false, { transform: booleanAttribute });

    columns: Column<ShopConfig>[] = [
        {
            field: 'id',
        },
        {
            field: 'details.name',
            cell: (d) => ({
                description: d.details.description,
                click: () => {
                    this.sidenavInfoService.toggle(ShopCardComponent, {
                        id: d.id,
                    });
                },
            }),
        },
        createPartyColumn((d) => ({ id: d.party_id }), {
            hidden: toObservable(this.noPartyColumn),
        }),
        {
            field: 'terms',
            lazyCell: (d) =>
                this.domainStoreService.getObject({ term_set_hierarchy: { id: d.terms.id } }).pipe(
                    map((obj) => ({
                        value: obj?.name,
                        description: obj?.description,
                        click: () => {
                            this.sidenavInfoService.toggle(DomainObjectCardComponent, {
                                ref: obj.ref,
                            });
                        },
                    })),
                ),
        },
        {
            field: 'location.url',
        },
        {
            field: 'account.currency.symbolic_code',
            header: 'Currency',
        },
        {
            field: 'blocking',
            cell: (d) => ({
                value: startCase(getUnionKey(d.blocking)),
                color: (
                    {
                        blocked: 'warn',
                        unblocked: 'success',
                    } as const
                )[getUnionKey(d.blocking)],
            }),
        },
        {
            field: 'suspension',
            cell: (d) => ({
                value: startCase(getUnionKey(d.suspension)),
                color: (
                    {
                        suspended: 'warn',
                        active: 'success',
                    } as const
                )[getUnionKey(d.suspension)],
            }),
        },
        createMenuColumn((d) =>
            this.getDelegatesByParty().pipe(
                map((delegatesByParty) => ({
                    items: [
                        ...delegatesByParty.rulesetIds.map((id) => {
                            const rulesetId =
                                delegatesByParty.delegatesWithPaymentInstitutionByParty
                                    ?.get?.(d.party_id)
                                    ?.find?.((v) => v?.partyDelegate?.ruleset?.id === id)
                                    ?.partyDelegate?.ruleset?.id;
                            return {
                                label: `Routing rules #${id}`,
                                click: () => this.openRoutingRules(rulesetId, d.id, d.party_id),
                                disabled: isNil(rulesetId),
                            };
                        }),
                        {
                            label:
                                getUnionKey(d.suspension) === 'suspended' ? 'Activate' : 'Suspend',
                            click: () => {
                                this.toggleSuspension(d);
                            },
                        },
                        {
                            label: getUnionKey(d.blocking) === 'blocked' ? 'Unblock' : 'Block',
                            click: () => {
                                this.toggleBlocking(d);
                            },
                        },
                    ],
                })),
            ),
        ),
    ];

    toggleBlocking(shop: ShopConfig) {
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
                        ? this.partyManagementService.BlockShop(
                              shop.party_id,
                              shop.id,
                              r.data.reason,
                          )
                        : this.partyManagementService.UnblockShop(
                              shop.party_id,
                              shop.id,
                              r.data.reason,
                          ),
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

    toggleSuspension(shop: ShopConfig) {
        this.dialogService
            .open(ConfirmDialogComponent, {
                title: getUnionKey(shop.suspension) === 'active' ? 'Suspend shop' : 'Activate shop',
            })
            .afterClosed()
            .pipe(
                filter((r) => r.status === DialogResponseStatus.Success),
                switchMap(() =>
                    getUnionKey(shop.suspension) === 'active'
                        ? this.partyManagementService.SuspendShop(shop.party_id, shop.id)
                        : this.partyManagementService.ActivateShop(shop.party_id, shop.id),
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

    private openRoutingRules(
        partyDelegateRulesetId: RoutingRulesetRef['id'],
        shopId: string,
        partyId: string,
    ) {
        this.domainStoreService
            .getFullObject({ routing_rules: { id: partyDelegateRulesetId } })
            .pipe(take(1))
            .subscribe((ruleset) => {
                const delegates =
                    ruleset?.object?.routing_rules?.data?.decisions?.delegates?.filter?.(
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
                shops?.length ? Array.from(new Set(shops.map((s) => s.party_id))) : [],
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
