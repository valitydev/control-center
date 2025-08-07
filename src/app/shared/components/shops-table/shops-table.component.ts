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
import { RoutingRulesetRef, ShopConfigObject } from '@vality/domain-proto/domain';
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
import { filter, startWith } from 'rxjs/operators';

import { DomainObjectsStoreService } from '../../../../api/domain-config';
import { PartiesStoreService } from '../../../../api/payment-processing';
import { createPartyColumn } from '../../../../utils';
import {
    DelegateWithPaymentInstitution,
    PartyDelegateRulesetsService,
} from '../../../sections/routing-rules/party-delegate-rulesets';
import { RoutingRulesType } from '../../../sections/routing-rules/types/routing-rules-type';
import { SidenavInfoService } from '../sidenav-info';
import { DomainObjectCardComponent } from '../thrift-api-crud/domain';

@Component({
    selector: 'cc-shops-table',
    imports: [InputFieldModule, MatCardModule, TableModule],
    templateUrl: './shops-table.component.html',
    providers: [PartyDelegateRulesetsService],
})
export class ShopsTableComponent {
    private sidenavInfoService = inject(SidenavInfoService);
    private partiesStoreService = inject(PartiesStoreService);
    private dialogService = inject(DialogService);
    private log = inject(NotifyLogService);
    private router = inject(Router);
    private partyDelegateRulesetsService = inject(PartyDelegateRulesetsService);
    private domainStoreService = inject(DomainObjectsStoreService);
    private injector = inject(Injector);

    shops = input<ShopConfigObject[]>([]);
    @Input() progress: number | boolean = false;
    @Output() update = new EventEmitter<UpdateOptions>();
    @Output() filterChange = new EventEmitter<string>();

    noPartyColumn = input(false, { transform: booleanAttribute });

    columns: Column<ShopConfigObject>[] = [
        {
            field: 'ref.id',
        },
        {
            field: 'details.name',
            cell: (d) => ({
                description: d.data.description,
                click: () => {
                    this.sidenavInfoService.toggle(DomainObjectCardComponent, {
                        ref: { shop_config: { id: d.ref.id } },
                    });
                },
            }),
        },
        createPartyColumn((d) => ({ id: d.data.party_id }), {
            hidden: toObservable(this.noPartyColumn),
        }),
        {
            field: 'terms',
            lazyCell: (d) =>
                this.domainStoreService
                    .getLimitedObject({ term_set_hierarchy: { id: d.data.terms.id } })
                    .value$.pipe(
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
                value: startCase(getUnionKey(d.data.block)),
                color: (
                    {
                        blocked: 'warn',
                        unblocked: 'success',
                    } as const
                )[getUnionKey(d.data.block)],
            }),
        },
        {
            field: 'suspension',
            cell: (d) => ({
                value: startCase(getUnionKey(d.data.suspension)),
                color: (
                    {
                        suspended: 'warn',
                        active: 'success',
                    } as const
                )[getUnionKey(d.data.suspension)],
            }),
        },
        createMenuColumn((d) =>
            this.getDelegatesByParty().pipe(
                map((delegatesByParty) => ({
                    items: [
                        ...delegatesByParty.rulesetIds.map((id) => {
                            const rulesetId =
                                delegatesByParty.delegatesWithPaymentInstitutionByParty
                                    ?.get?.(d.data.party_id)
                                    ?.find?.((v) => v?.partyDelegate?.ruleset?.id === id)
                                    ?.partyDelegate?.ruleset?.id;
                            return {
                                label: `Routing rules #${id}`,
                                click: () =>
                                    this.openRoutingRules(rulesetId, d.ref.id, d.data.party_id),
                                disabled: isNil(rulesetId),
                            };
                        }),
                        {
                            label:
                                getUnionKey(d.data.suspension) === 'suspended'
                                    ? 'Activate'
                                    : 'Suspend',
                            click: () => {
                                this.toggleSuspension(d);
                            },
                        },
                        {
                            label: getUnionKey(d.data.block) === 'blocked' ? 'Unblock' : 'Block',
                            click: () => {
                                this.toggleBlocking(d);
                            },
                        },
                    ],
                })),
            ),
        ),
    ];

    toggleBlocking(shop: ShopConfigObject) {
        this.dialogService
            .open(ConfirmDialogComponent, {
                title: getUnionKey(shop.data.block) === 'unblocked' ? 'Block shop' : 'Unblock shop',
                hasReason: true,
            })
            .afterClosed()
            .pipe(
                filter((r) => r.status === DialogResponseStatus.Success),
                switchMap((r) =>
                    getUnionKey(shop.data.block) === 'unblocked'
                        ? this.partiesStoreService.blockShop(shop, r.data.reason)
                        : this.partiesStoreService.unblockShop(shop, r.data.reason),
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

    toggleSuspension(shop: ShopConfigObject) {
        this.dialogService
            .open(ConfirmDialogComponent, {
                title:
                    getUnionKey(shop.data.suspension) === 'active'
                        ? 'Suspend shop'
                        : 'Activate shop',
            })
            .afterClosed()
            .pipe(
                filter((r) => r.status === DialogResponseStatus.Success),
                switchMap(() =>
                    getUnionKey(shop.data.suspension) === 'active'
                        ? this.partiesStoreService.suspendShop(shop)
                        : this.partiesStoreService.activateShop(shop),
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
            .getObject({ routing_rules: { id: partyDelegateRulesetId } })
            .getFirstValue()
            .subscribe((ruleset) => {
                const delegates =
                    ruleset?.object?.routing_rules?.data?.decisions?.delegates?.filter?.(
                        (delegate) =>
                            delegate?.allowed?.condition?.party?.id === partyId &&
                            delegate?.allowed?.condition?.party?.definition?.shop_is === shopId,
                    ) || [];
                const paymentRulesCommands = [
                    '/parties',
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
                shops?.length ? Array.from(new Set(shops.map((s) => s.data.party_id))) : [],
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
