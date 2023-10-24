import { CommonModule } from '@angular/common';
import {
    Component,
    Output,
    EventEmitter,
    ViewChild,
    TemplateRef,
    Input,
    booleanAttribute,
    OnChanges,
} from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { Sort } from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import { Shop } from '@vality/domain-proto/domain';
import {
    InputFieldModule,
    TableModule,
    Column,
    createOperationColumn,
    DialogService,
    NotifyLogService,
    progressTo,
    ConfirmDialogComponent,
    DialogResponseStatus,
    ComponentChanges,
} from '@vality/ng-core';
import startCase from 'lodash-es/startCase';
import { map, switchMap, BehaviorSubject } from 'rxjs';
import { shareReplay, filter } from 'rxjs/operators';
import { Memoize } from 'typescript-memoize';

import { getUnionKey } from '../../../../utils';
import { PartyManagementService } from '../../../api/payment-processing';
import { SidenavInfoService } from '../sidenav-info';
import { DomainThriftViewerComponent } from '../thrift-api-crud';

@Component({
    selector: 'cc-shops-table',
    standalone: true,
    imports: [
        CommonModule,
        DomainThriftViewerComponent,
        FlexModule,
        InputFieldModule,
        MatCardModule,
        TableModule,
    ],
    templateUrl: './shops-table.component.html',
})
export class ShopsTableComponent implements OnChanges {
    @Input() shops!: Shop[];
    @Input({ transform: booleanAttribute }) changed!: boolean;
    @Input() progress: number | boolean = false;
    @Input({ transform: booleanAttribute }) noSort: boolean = false;
    @Output() update = new EventEmitter<void>();

    @ViewChild('shopTpl') shopTpl: TemplateRef<unknown>;
    @ViewChild('contractTpl') contractTpl: TemplateRef<unknown>;

    selectedShop?: Shop;
    columns: Column<Shop>[] = this.getColumns();
    contractProgress$ = new BehaviorSubject(0);
    sort: Sort = {
        active: 'details.name',
        direction: 'asc',
    };

    constructor(
        private route: ActivatedRoute,
        private sidenavInfoService: SidenavInfoService,
        private partyManagementService: PartyManagementService,
        private dialogService: DialogService,
        private log: NotifyLogService,
    ) {}

    ngOnChanges(changes: ComponentChanges<ShopsTableComponent>) {
        if (changes.noSort) {
            this.columns = this.getColumns();
            this.sort = { active: '', direction: '' };
        }
    }

    @Memoize()
    getContract(shopID: string) {
        return this.partyManagementService
            .GetShopContract(this.route.snapshot.params.partyID, shopID)
            .pipe(
                progressTo(this.contractProgress$),
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
                    this.update.emit();
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
                    this.update.emit();
                    this.log.success();
                },
                error: (err) => {
                    this.log.error(err);
                },
            });
    }

    private getColumns(): Column<Shop>[] {
        return [
            {
                field: 'details.name',
                description: 'id',
                pinned: 'left',
                click: (d) => {
                    this.selectedShop = d;
                    this.sidenavInfoService.toggle(
                        this.shopTpl,
                        d.details.name || `Shop #${d.id}`,
                        d,
                    );
                },
                sortable: !this.noSort,
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
                    label: (shop) =>
                        getUnionKey(shop.blocking) === 'blocked' ? 'Unblock' : 'Block',
                    click: (shop) => {
                        this.toggleBlocking(shop);
                    },
                },
            ]),
        ];
    }
}
