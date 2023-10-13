import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Shop } from '@vality/domain-proto/domain';
import {
    Column,
    ConfirmDialogComponent,
    createOperationColumn,
    DialogResponseStatus,
    DialogService,
    NotifyLogService,
    progressTo,
} from '@vality/ng-core';
import startCase from 'lodash-es/startCase';
import { BehaviorSubject, combineLatest, map, switchMap } from 'rxjs';
import { debounceTime, filter, shareReplay, startWith } from 'rxjs/operators';
import { Memoize } from 'typescript-memoize';

import { PartyManagementService } from '@cc/app/api/payment-processing';
import { SidenavInfoService } from '@cc/app/shared/components/sidenav-info';
import { getUnionKey } from '@cc/utils';

import { PartyShopsService } from './party-shops.service';

@Component({
    templateUrl: 'party-shops.component.html',
    providers: [PartyShopsService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartyShopsComponent {
    @ViewChild('shopTpl') shopTpl: TemplateRef<unknown>;
    @ViewChild('contractTpl') contractTpl: TemplateRef<unknown>;

    filterControl = new FormControl('');
    shops$ = combineLatest([
        this.partyShopsService.shops$,
        this.filterControl.valueChanges.pipe(
            startWith(this.filterControl.value),
            debounceTime(200),
        ),
    ]).pipe(
        map(([shops, searchStr]) =>
            shops.filter((s) => JSON.stringify(s).toLowerCase().includes(searchStr.toLowerCase())),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    selectedShop?: Shop;
    columns: Column<Shop>[] = [
        {
            field: 'details.name',
            description: 'id',
            pinned: 'left',
            click: (d) => {
                this.selectedShop = d;
                this.sidenavInfoService.toggle(this.shopTpl, d.details.name || `Shop #${d.id}`, d);
            },
        },
        {
            field: 'contract_id',
            header: 'Contract',
            click: (d) => {
                this.selectedShop = d;
                this.sidenavInfoService.toggle(this.contractTpl, `Contract #${d.id}`, d);
            },
        },
        {
            field: 'details.description',
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
            type: 'tag',
            formatter: (shop) => getUnionKey(shop.blocking),
            typeParameters: {
                label: (shop) => startCase(getUnionKey(shop.blocking)),
                tags: {
                    blocked: { color: 'warn' },
                    unblocked: { color: 'success' },
                },
            },
        },
        {
            field: 'suspension',
            type: 'tag',
            formatter: (shop) => getUnionKey(shop.suspension),
            typeParameters: {
                label: (shop) => startCase(getUnionKey(shop.suspension)),
                tags: {
                    suspended: { color: 'warn' },
                    active: { color: 'success' },
                },
            },
        },
        createOperationColumn([
            {
                label: (shop) =>
                    getUnionKey(shop.suspension) === 'suspended' ? 'Activate' : 'Suspend',
                click: (shop) => {
                    this.toggleSuspension(shop);
                },
            },
            {
                label: (shop) => (getUnionKey(shop.blocking) === 'blocked' ? 'Unblock' : 'Block'),
                click: (shop) => {
                    this.toggleBlocking(shop);
                },
            },
        ]),
    ];
    progress$ = new BehaviorSubject(0);

    constructor(
        private partyShopsService: PartyShopsService,
        private route: ActivatedRoute,
        private sidenavInfoService: SidenavInfoService,
        private partyManagementService: PartyManagementService,
        private dialogService: DialogService,
        private log: NotifyLogService,
    ) {}

    @Memoize()
    getContract(shopID: string) {
        return this.partyManagementService
            .GetShopContract(this.route.snapshot.params.partyID, shopID)
            .pipe(
                progressTo(this.progress$),
                map((c) => c.contract),
                shareReplay({ refCount: true, bufferSize: 1 }),
            );
    }

    toggleBlocking(shop: Shop) {
        const partyID = this.route.snapshot.params.partyID;
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
                        ? this.partyManagementService.BlockShop(partyID, shop.id, r.data.reason)
                        : this.partyManagementService.UnblockShop(partyID, shop.id, r.data.reason),
                ),
            )
            .subscribe({
                next: () => {
                    this.partyShopsService.reload();
                    this.log.success();
                },
                error: (err) => {
                    this.log.error(err);
                },
            });
    }

    toggleSuspension(shop: Shop) {
        const partyID = this.route.snapshot.params.partyID;
        this.dialogService
            .open(ConfirmDialogComponent, {
                title: getUnionKey(shop.suspension) === 'active' ? 'Suspend shop' : 'Activate shop',
            })
            .afterClosed()
            .pipe(
                filter((r) => r.status === DialogResponseStatus.Success),
                switchMap(() =>
                    getUnionKey(shop.suspension) === 'active'
                        ? this.partyManagementService.SuspendShop(partyID, shop.id)
                        : this.partyManagementService.ActivateShop(partyID, shop.id),
                ),
            )
            .subscribe({
                next: () => {
                    this.partyShopsService.reload();
                    this.log.success();
                },
                error: (err) => {
                    this.log.error(err);
                },
            });
    }
}
