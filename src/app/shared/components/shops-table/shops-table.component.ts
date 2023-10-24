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
import { Shop, Party, Contract } from '@vality/domain-proto/domain';
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
import { filter } from 'rxjs/operators';

import { getUnionKey } from '../../../../utils';
import { PartyManagementService } from '../../../api/payment-processing';
import { SidenavInfoService } from '../sidenav-info';
import { DomainThriftViewerComponent } from '../thrift-api-crud';

interface ShopParty {
    shop: Shop;
    party: Party;
}

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
    @Input() shops!: ShopParty[];
    @Input({ transform: booleanAttribute }) changed!: boolean;
    @Input() progress: number | boolean = false;
    @Input({ transform: booleanAttribute }) noSort: boolean = false;
    @Output() update = new EventEmitter<void>();

    @ViewChild('shopTpl') shopTpl: TemplateRef<unknown>;
    @ViewChild('contractTpl') contractTpl: TemplateRef<unknown>;

    selectedShop?: Shop;
    selectedContract?: Contract;
    columns: Column<ShopParty>[] = this.getColumns();
    contractProgress$ = new BehaviorSubject(0);
    sort: Sort = {
        active: 'details.name',
        direction: 'asc',
    };

    constructor(
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

    private getColumns(): Column<ShopParty>[] {
        return [
            {
                field: 'shop.details.name',
                description: 'shop.id',
                pinned: 'left',
                click: (d) => {
                    this.selectedShop = d.shop;
                    this.sidenavInfoService.toggle(
                        this.shopTpl,
                        d.shop.details.name || `Shop #${d.shop.id}`,
                        d.shop,
                    );
                },
                sortable: !this.noSort,
            },
            {
                field: 'party.name',
                header: 'Party',
                description: 'party.id',
                link: (d) => `/party/${d.party.id}`,
            },
            {
                field: 'shop.contract_id',
                header: 'Contract',
                click: (d) => {
                    this.partyManagementService
                        .GetShopContract(d.party.id, d.shop.id)
                        .pipe(
                            progressTo(this.contractProgress$),
                            map((c) => c.contract),
                        )
                        .subscribe((contract) => {
                            this.selectedContract = contract;
                            this.sidenavInfoService.toggle(
                                this.contractTpl,
                                `Contract #${d.shop.id}`,
                                d.shop,
                            );
                        });
                },
            },
            {
                field: 'shop.details.description',
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
            createOperationColumn([
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
        ];
    }
}
