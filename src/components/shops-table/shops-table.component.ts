import startCase from 'lodash-es/startCase';
import { map, switchMap } from 'rxjs';
import { combineLatestWith, filter, shareReplay } from 'rxjs/operators';
import { MemoizeExpiring } from 'typescript-memoize';

import {
    Component,
    EventEmitter,
    Injector,
    Input,
    Output,
    booleanAttribute,
    inject,
    input,
    runInInjectionContext,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

import { ShopConfigObject } from '@vality/domain-proto/domain';
import { LimitedVersionedObject } from '@vality/domain-proto/domain_config_v2';
import {
    Column,
    ConfirmDialogComponent,
    DialogResponseStatus,
    DialogService,
    MenuItem,
    NotifyLogService,
    TableModule,
    UpdateOptions,
    createMenuColumn,
} from '@vality/matez';
import { getUnionKey } from '@vality/ng-thrift';

import { PartiesStoreService, ShopWithInfo } from '~/api/payment-processing';
import { ThriftPartyManagementService } from '~/api/services';
import { createCurrencyColumn, createDomainObjectColumn, createPartyColumn } from '~/utils';

import { PartyDelegateRulesetsService } from '../../app/parties/party/routing-rules/party-delegate-rulesets';
import { RoutingRulesType } from '../../app/parties/party/routing-rules/types/routing-rules-type';
import { SidenavInfoService } from '../sidenav-info';
import { DomainObjectCardComponent } from '../thrift-api-crud/domain';

import { getDelegatesByPartyItem } from './utils/get-rr-by-party-item';

@Component({
    selector: 'cc-shops-table',
    imports: [TableModule],
    templateUrl: './shops-table.component.html',
    providers: [PartyDelegateRulesetsService],
})
export class ShopsTableComponent {
    private sidenavInfoService = inject(SidenavInfoService);
    private partiesStoreService = inject(PartiesStoreService);
    private dialogService = inject(DialogService);
    private log = inject(NotifyLogService);
    private injector = inject(Injector);
    private partyManagementService = inject(ThriftPartyManagementService);

    shops = input<ShopWithInfo[]>([]);
    isHistoryView = input(false, { transform: booleanAttribute });
    @Input() progress: number | boolean = false;
    @Input() hasMore: boolean = false;
    @Output() update = new EventEmitter<UpdateOptions>();
    @Output() filterChange = new EventEmitter<string>();
    @Output() more = new EventEmitter<void>();

    extendMenu = input<(d: LimitedVersionedObject) => MenuItem[]>();
    noPartyColumn = input(false, { transform: booleanAttribute });

    columns: Column<ShopWithInfo>[] = [
        {
            field: 'ref.id',
        },
        {
            field: 'name',
            cell: (d) => ({
                value: d.data.name,
                description: d.data.description,
                click: () => {
                    this.sidenavInfoService.toggle(DomainObjectCardComponent, {
                        ref: { shop_config: { id: d.ref.id } },
                    });
                },
            }),
        },
        createPartyColumn((d) => ({ id: d.data.party_ref.id }), {
            hidden: toObservable(this.noPartyColumn),
        }),
        createDomainObjectColumn((d) => ({ ref: { term_set_hierarchy: d.data.terms } }), {
            field: 'terms',
        }),
        {
            field: 'location.url',
            cell: (d) => ({ value: d.data.location.url }),
        },
        {
            field: 'currency',
            cell: (d) => ({ value: d.data.account.currency.symbolic_code }),
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
        {
            field: 'Settlement/Guarantee Accounts',
            header: { value: 'Accounts', description: 'Settlement/Guarantee' },
            cell: (d) => ({
                value: d.data.account.settlement,
                description: d.data.account.guarantee,
            }),
        },
        createCurrencyColumn(
            (d) =>
                this.getSettlementAccountState(d).pipe(
                    map((b) => ({ amount: b.own_amount, code: b.currency.symbolic_code })),
                ),
            {
                header: 'Own',
                isLazyCell: true,
                hidden: toObservable(this.isHistoryView, { injector: this.injector }),
            },
        ),
        createCurrencyColumn(
            (d) =>
                this.getSettlementAccountState(d).pipe(
                    map((b) => ({
                        amount: b.own_amount - b.available_amount,
                        code: b.currency.symbolic_code,
                    })),
                ),
            {
                header: 'Hold',
                isLazyCell: true,
                hidden: toObservable(this.isHistoryView, { injector: this.injector }),
            },
        ),
        createCurrencyColumn(
            (d) =>
                this.getSettlementAccountState(d).pipe(
                    map((b) => ({ amount: b.available_amount, code: b.currency.symbolic_code })),
                ),
            {
                header: 'Available',
                isLazyCell: true,
                hidden: toObservable(this.isHistoryView, { injector: this.injector }),
            },
        ),
        createCurrencyColumn(
            (d) =>
                this.getGuaranteeAccountState(d).pipe(
                    map((b) => ({ amount: b.own_amount, code: b.currency.symbolic_code })),
                ),
            {
                header: 'Guarantee Own',
                isLazyCell: true,
                hidden: toObservable(this.isHistoryView, { injector: this.injector }),
            },
        ),
        createCurrencyColumn(
            (d) =>
                this.getGuaranteeAccountState(d).pipe(
                    map((b) => ({
                        amount: b.own_amount - b.available_amount,
                        code: b.currency.symbolic_code,
                    })),
                ),
            {
                header: 'Guarantee Hold',
                isLazyCell: true,
                hidden: toObservable(this.isHistoryView, { injector: this.injector }),
            },
        ),
        createCurrencyColumn(
            (d) =>
                this.getGuaranteeAccountState(d).pipe(
                    map((b) => ({ amount: b.available_amount, code: b.currency.symbolic_code })),
                ),
            {
                header: 'Guarantee Available',
                isLazyCell: true,
                hidden: toObservable(this.isHistoryView, { injector: this.injector }),
            },
        ),
        { field: 'version', cell: (d) => ({ value: d.info.version }) },
        { field: 'changed_at', cell: (d) => ({ value: d.info.changed_at, type: 'datetime' }) },
        {
            field: 'changed_by',
            cell: (d) => ({
                value: d.info.changed_by?.name,
                description: d.info.changed_by?.email,
            }),
        },
        createMenuColumn((d) =>
            toObservable(this.shops, { injector: this.injector }).pipe(
                switchMap((shops) =>
                    runInInjectionContext(this.injector, () =>
                        getDelegatesByPartyItem(
                            shops?.length ? shops.map((s) => s.data.party_ref.id) : [],
                            RoutingRulesType.Payment,
                            d.data.party_ref.id,
                            d.ref.id,
                        ),
                    ),
                ),
                map((rr) => ({
                    items: [
                        ...rr.partyRr,
                        ...rr.itemRr,
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
                combineLatestWith(toObservable(this.extendMenu, { injector: this.injector })),
                map(([menu, extendMenu]) => ({
                    ...menu,
                    items: extendMenu
                        ? [
                              ...menu.items,
                              ...extendMenu({
                                  name: d.data.name,
                                  description: d.data.description,
                                  ref: { shop_config: d.ref },
                                  info: d.info,
                              }),
                          ]
                        : menu.items,
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

    @MemoizeExpiring(5 * 60_000)
    getSettlementAccountState(shop: ShopWithInfo) {
        return this.partyManagementService
            .GetAccountState(shop.data.party_ref, shop.data.account.settlement, shop.info.version)
            .pipe(shareReplay({ refCount: true, bufferSize: 1 }));
    }

    @MemoizeExpiring(5 * 60_000)
    getGuaranteeAccountState(shop: ShopWithInfo) {
        return this.partyManagementService
            .GetAccountState(shop.data.party_ref, shop.data.account.guarantee, shop.info.version)
            .pipe(shareReplay({ refCount: true, bufferSize: 1 }));
    }
}
