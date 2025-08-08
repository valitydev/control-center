import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DomainObjectType } from '@vality/domain-proto/domain';
import { VersionedObject } from '@vality/domain-proto/domain_config_v2';
import { PartyManagement } from '@vality/domain-proto/payment_processing';
import {
    Column,
    DebounceTime,
    FiltersModule,
    ListFieldModule,
    SwitchButtonModule,
    TableModule,
    UpdateOptions,
} from '@vality/matez';
import { ThriftFormModule } from '@vality/ng-thrift';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { MemoizeExpiring } from 'typescript-memoize';

import { FetchFullDomainObjectsService } from '../../../api/domain-config';
import { createCurrencyColumn, createPartyColumn } from '../../../utils';
import { PageLayoutModule } from '../../shared';
import { MerchantFieldModule } from '../../shared/components/merchant-field';
import { PartyStoreService } from '../party';

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
export class WalletsComponent implements OnInit {
    private fetchFullDomainObjectsService = inject(FetchFullDomainObjectsService);
    private partyStoreService = inject(PartyStoreService);
    private partyManagementService = inject(PartyManagement);

    wallets$ = this.fetchFullDomainObjectsService.result$;
    isLoading$ = this.fetchFullDomainObjectsService.isLoading$;

    columns: Column<VersionedObject>[] = [
        { field: 'id', cell: (d) => ({ value: d.object.wallet_config.ref.id }) },
        { field: 'name', cell: (d) => ({ value: d.object.wallet_config.data.name }) },
        createPartyColumn((d) => ({ id: d.object.wallet_config.data.party_id })),
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

    ngOnInit() {
        this.fetchFullDomainObjectsService.load({
            type: DomainObjectType.wallet_config,
            query: '',
        });
    }

    @DebounceTime()
    search(query: string) {
        this.fetchFullDomainObjectsService.load({ query, type: DomainObjectType.wallet_config });
    }

    reload(options: UpdateOptions) {
        this.fetchFullDomainObjectsService.reload(options);
    }

    more() {
        this.fetchFullDomainObjectsService.more();
    }

    @MemoizeExpiring(5 * 60_000)
    getAccountState(wallet: VersionedObject) {
        return this.partyManagementService
            .GetWalletAccount(
                wallet.object.wallet_config.data.party_id,
                wallet.object.wallet_config.ref.id,
                Number.MAX_SAFE_INTEGER,
            )
            .pipe(
                switchMap((account) =>
                    this.partyManagementService.GetAccountState(
                        wallet.object.wallet_config.data.party_id,
                        account.settlement,
                        Number.MAX_SAFE_INTEGER,
                    ),
                ),
                shareReplay({ refCount: true, bufferSize: 1 }),
            );
    }
}
