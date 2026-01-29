import { startCase } from 'lodash-es';
import { combineLatestWith, filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { MemoizeExpiring } from 'typescript-memoize';

import { Component, Injector, inject, input, runInInjectionContext } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

import { LimitedVersionedObject, VersionedObject } from '@vality/domain-proto/domain_config_v2';
import {
    Column,
    ConfirmDialogComponent,
    DialogResponseStatus,
    DialogService,
    MenuItem,
    NotifyLogService,
    ObservableResource,
    TableResourceComponent,
    createMenuColumn,
} from '@vality/matez';
import { getUnionKey } from '@vality/ng-thrift';

import { PartiesStoreService } from '~/api/payment-processing';
import { ThriftPartyManagementService } from '~/api/services';
import { getDelegatesByPartyItem } from '~/components/shops-table/utils/get-rr-by-party-item';
import { SidenavInfoService } from '~/components/sidenav-info';
import { DomainObjectCardComponent } from '~/components/thrift-api-crud';
import { createCurrencyColumn, createDomainObjectColumn, createPartyColumn } from '~/utils';

import { PartyDelegateRulesetsService } from '../../app/parties/party/routing-rules/party-delegate-rulesets';
import { RoutingRulesType } from '../../app/parties/party/routing-rules/types/routing-rules-type';

@Component({
    selector: 'cc-wallets-table',
    templateUrl: './wallets-table.component.html',
    imports: [TableResourceComponent],
    providers: [PartyDelegateRulesetsService],
})
export class WalletsTableComponent {
    private partyManagementService = inject(ThriftPartyManagementService);
    private injector = inject(Injector);
    private log = inject(NotifyLogService);
    private dialogService = inject(DialogService);
    private partiesStoreService = inject(PartiesStoreService);
    private sidenavInfoService = inject(SidenavInfoService);

    resource = input<ObservableResource<unknown, unknown, VersionedObject[]>>();
    extendMenu = input<(d: LimitedVersionedObject) => MenuItem[]>(() => []);

    columns: Column<VersionedObject>[] = [
        { field: 'id', cell: (d) => ({ value: d.object.wallet_config.ref.id }) },
        {
            field: 'name',
            cell: (d) => ({
                value: d.object.wallet_config.data.name,
                description: d.object.wallet_config.data.description,
                click: () => {
                    this.sidenavInfoService.toggle(DomainObjectCardComponent, {
                        ref: { wallet_config: { id: d.object.wallet_config.ref.id } },
                    });
                },
            }),
        },
        createPartyColumn((d) => ({ id: d.object.wallet_config.data.party_ref.id })),
        {
            field: 'blocking',
            cell: (d) => ({
                value: startCase(getUnionKey(d.object.wallet_config.data.block)),
                color: (
                    {
                        blocked: 'warn',
                        unblocked: 'success',
                    } as const
                )[getUnionKey(d.object.wallet_config.data.block)],
            }),
        },
        {
            field: 'suspension',
            cell: (d) => ({
                value: startCase(getUnionKey(d.object.wallet_config.data.suspension)),
                color: (
                    {
                        suspended: 'warn',
                        active: 'success',
                    } as const
                )[getUnionKey(d.object.wallet_config.data.suspension)],
            }),
        },
        createDomainObjectColumn(
            (d) => ({
                ref: { payment_institution: d.object.wallet_config.data.payment_institution },
            }),
            { field: 'payment_institution' },
        ),
        createDomainObjectColumn(
            (d) => ({
                ref: { term_set_hierarchy: d.object.wallet_config.data.terms },
            }),
            { field: 'terms' },
        ),
        createCurrencyColumn(
            (d) =>
                this.getAccountState(d).pipe(
                    map((b) => ({ amount: b.own_amount, code: b.currency.symbolic_code })),
                ),
            { header: 'Own', isLazyCell: true },
        ),
        createCurrencyColumn(
            (d) =>
                this.getAccountState(d).pipe(
                    map((b) => ({
                        amount: b.own_amount - b.available_amount,
                        code: b.currency.symbolic_code,
                    })),
                ),
            { header: 'Hold', isLazyCell: true },
        ),
        createCurrencyColumn(
            (d) =>
                this.getAccountState(d).pipe(
                    map((b) => ({ amount: b.available_amount, code: b.currency.symbolic_code })),
                ),
            { header: 'Available', isLazyCell: true },
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
            this.resource().value$.pipe(
                switchMap((wallets) =>
                    runInInjectionContext(this.injector, () =>
                        getDelegatesByPartyItem(
                            wallets?.length
                                ? wallets.map((w) => w.object.wallet_config.data.party_ref.id)
                                : [],
                            RoutingRulesType.Withdrawal,
                            d.object.wallet_config.data.party_ref.id,
                            d.object.wallet_config.ref.id,
                        ),
                    ),
                ),
                map((rr) => [
                    ...rr.partyRr,
                    ...rr.itemRr,
                    {
                        label:
                            getUnionKey(d.object.wallet_config.data.suspension) === 'suspended'
                                ? 'Activate'
                                : 'Suspend',
                        click: () => {
                            this.toggleSuspension(d);
                        },
                    },
                    {
                        label:
                            getUnionKey(d.object.wallet_config.data.block) === 'blocked'
                                ? 'Unblock'
                                : 'Block',
                        click: () => {
                            this.toggleBlocking(d);
                        },
                    },
                ]),
                combineLatestWith(
                    toObservable(this.extendMenu, { injector: this.injector }).pipe(
                        map((extendMenu) =>
                            extendMenu
                                ? extendMenu({
                                      name: d.object.wallet_config.data.name,
                                      description: d.object.wallet_config.data.description,
                                      ref: { wallet_config: d.object.wallet_config.ref },
                                      info: d.info,
                                  })
                                : [],
                        ),
                    ),
                ),
                map(([items, extendItems]) => ({ items: [...items, ...extendItems] })),
            ),
        ),
    ];

    @MemoizeExpiring(5 * 60_000)
    getAccountState(wallet: VersionedObject) {
        return this.partyManagementService
            .GetAccountState(
                wallet.object.wallet_config.data.party_ref,
                wallet.object.wallet_config.data.account.settlement,
                wallet.info.version,
            )
            .pipe(shareReplay({ refCount: true, bufferSize: 1 }));
    }

    toggleBlocking(obj: VersionedObject) {
        const wallet = obj.object.wallet_config;
        this.dialogService
            .open(ConfirmDialogComponent, {
                title:
                    getUnionKey(wallet.data.block) === 'unblocked'
                        ? 'Block wallet'
                        : 'Unblock wallet',
                hasReason: true,
            })
            .afterClosed()
            .pipe(
                filter((r) => r.status === DialogResponseStatus.Success),
                switchMap((r) =>
                    getUnionKey(wallet.data.block) === 'unblocked'
                        ? this.partiesStoreService.blockWallet(wallet, r.data.reason)
                        : this.partiesStoreService.unblockWallet(wallet, r.data.reason),
                ),
            )
            .subscribe({
                next: () => {
                    this.resource().reload();
                    this.log.success();
                },
                error: (err) => {
                    this.log.error(err);
                },
            });
    }

    toggleSuspension(obj: VersionedObject) {
        const wallet = obj.object.wallet_config;
        this.dialogService
            .open(ConfirmDialogComponent, {
                title:
                    getUnionKey(wallet.data.suspension) === 'active'
                        ? 'Suspend wallet'
                        : 'Activate wallet',
            })
            .afterClosed()
            .pipe(
                filter((r) => r.status === DialogResponseStatus.Success),
                switchMap(() =>
                    getUnionKey(wallet.data.suspension) === 'active'
                        ? this.partiesStoreService.suspendWallet(wallet)
                        : this.partiesStoreService.activateWallet(wallet),
                ),
            )
            .subscribe({
                next: () => {
                    this.resource().reload();
                    this.log.success();
                },
                error: (err) => {
                    this.log.error(err);
                },
            });
    }
}
