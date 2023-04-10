import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { StatWallet } from '@vality/fistful-proto/internal/fistful_stat';
import { clean, splitIds } from '@vality/ng-core';
import { of } from 'rxjs';
import { startWith, map, shareReplay, switchMap, catchError } from 'rxjs/operators';
import { Memoize } from 'typescript-memoize';

import { AccounterService } from '@cc/app/api/accounter';
import { WalletParams } from '@cc/app/api/fistful-stat/query-dsl/types/wallet';
import { ManagementService } from '@cc/app/api/wallet';
import { QueryParamsService } from '@cc/app/shared/services';
import {
    createDatetimeFormattedColumn,
    createDescriptionFormattedColumn,
    createGridColumns,
} from '@cc/components/simple-table';

import { FetchWalletsService } from './fetch-wallets.service';

@UntilDestroy()
@Component({
    selector: 'cc-wallets',
    templateUrl: './wallets.component.html',
    providers: [FetchWalletsService],
    styleUrls: ['wallets.component.scss'],
})
export class WalletsComponent implements OnInit {
    wallets$ = this.fetchWalletsService.searchResult$;
    inProgress$ = this.fetchWalletsService.doAction$;
    hasMore$ = this.fetchWalletsService.hasMore$;
    columns = createGridColumns<StatWallet>([
        createDescriptionFormattedColumn('name', 'id'),
        'currency_symbolic_code',
        'identity_id',
        createDatetimeFormattedColumn('created_at'),
        'balance',
    ]);
    filters = this.fb.group<WalletParams>({
        party_id: null,
        identity_id: null,
        currency_code: null,
        wallet_id: null,
        ...this.qp.params,
    });

    test$ = this.getBalance('294');

    constructor(
        private fetchWalletsService: FetchWalletsService,
        private qp: QueryParamsService<WalletParams>,
        private fb: FormBuilder,
        private walletManagementService: ManagementService,
        private accounterService: AccounterService
    ) {}

    ngOnInit() {
        this.filters.valueChanges
            .pipe(
                startWith(this.filters.value),
                map((v) => ({ ...v, wallet_id: splitIds(v.wallet_id) })),
                map((v) => clean(v)),
                untilDestroyed(this)
            )
            .subscribe((value) => {
                void this.qp.set(value);
                this.search();
            });
    }

    search(size?: number) {
        const { wallet_id, ...v } = this.filters.value;
        this.fetchWalletsService.search(clean({ ...v, wallet_id: splitIds(wallet_id) }), size);
    }

    fetchMore() {
        this.fetchWalletsService.fetchMore();
    }

    @Memoize()
    getBalance(walletId: string) {
        return this.walletManagementService.Get(walletId, {}).pipe(
            switchMap((wallet) => this.accounterService.GetAccountByID(Number(wallet.account.id))),
            catchError(() =>
                of({
                    own_amount: '?',
                    currency_sym_code: '',
                })
            ),
            shareReplay({ refCount: true, bufferSize: 1 })
        );
    }
}
