import { startCase } from 'lodash-es';
import { map, shareReplay } from 'rxjs/operators';
import { MemoizeExpiring } from 'typescript-memoize';

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { VersionedObject } from '@vality/domain-proto/domain_config_v2';
import {
    Column,
    FiltersModule,
    ListFieldModule,
    SwitchButtonModule,
    TableModule,
    UpdateOptions,
} from '@vality/matez';
import { ThriftFormModule, getUnionKey } from '@vality/ng-thrift';

import { DomainObjectsStoreService, FetchFullDomainObjectsService } from '~/api/domain-config';
import { ThriftPartyManagementService } from '~/api/services';
import { MerchantFieldModule } from '~/components/merchant-field';
import { PageLayoutModule } from '~/components/page-layout';
import { createCurrencyColumn, createDomainObjectColumn, createPartyColumn } from '~/utils';

import { PartyStoreService } from '../parties/party';

@Component({
    selector: 'cc-wallets',
    templateUrl: './wallets.component.html',
    providers: [PartyStoreService, FetchFullDomainObjectsService],
    imports: [
        CommonModule,
        MatCardModule,
        TableModule,
        MatProgressSpinnerModule,
        ThriftFormModule,
        ReactiveFormsModule,
        MatInputModule,
        MerchantFieldModule,
        MatButtonModule,
        MatIconModule,
        PageLayoutModule,
        ListFieldModule,
        FiltersModule,
        SwitchButtonModule,
    ],
})
export class WalletsComponent {
    private domainObjectsStoreService = inject(DomainObjectsStoreService);
    private partyStoreService = inject(PartyStoreService);
    private partyManagementService = inject(ThriftPartyManagementService);

    wallets = this.domainObjectsStoreService
        .getObjects('wallet_config')
        .map((wallets) =>
            this.partyStoreService.id$.pipe(
                map((id) =>
                    id
                        ? wallets.filter((w) => w.object.wallet_config.data.party_ref.id === id)
                        : wallets,
                ),
            ),
        );

    columns: Column<VersionedObject>[] = [
        { field: 'id', cell: (d) => ({ value: d.object.wallet_config.ref.id }) },
        { field: 'name', cell: (d) => ({ value: d.object.wallet_config.data.name }) },
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
    ];
    party$ = this.partyStoreService.party$;

    reload(_options: UpdateOptions) {
        this.wallets.reload();
    }

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
}
