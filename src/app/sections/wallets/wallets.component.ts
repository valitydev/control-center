import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { AccountBalance } from '@vality/fistful-proto/internal/account';
import { StatWallet } from '@vality/fistful-proto/internal/fistful_stat';
import {
    clean,
    splitBySeparators,
    Column,
    QueryParamsService,
    NotifyLogService,
} from '@vality/ng-core';
import { of, switchMap } from 'rxjs';
import { startWith, map, shareReplay, catchError } from 'rxjs/operators';
import { Memoize } from 'typescript-memoize';

import { WalletParams } from '@cc/app/api/fistful-stat/query-dsl/types/wallet';
import { ManagementService } from '@cc/app/api/wallet';

import { AmountCurrencyService } from '../../shared/services';

import { FetchWalletsService } from './fetch-wallets.service';

@UntilDestroy()
@Component({
    selector: 'cc-wallets',
    templateUrl: './wallets.component.html',
    providers: [FetchWalletsService],
})
export class WalletsComponent implements OnInit {
    wallets$ = this.fetchWalletsService.searchResult$;
    inProgress$ = this.fetchWalletsService.doAction$;
    hasMore$ = this.fetchWalletsService.hasMore$;
    columns: Column<StatWallet>[] = [
        { field: 'name', description: 'id' },
        'currency_symbolic_code',
        'identity_id',
        { field: 'created_at', type: 'datetime' },
        {
            field: 'balance',
            type: 'currency',
            lazy: true,
            formatter: (d) =>
                this.getBalance(d.id).pipe(
                    switchMap((balance) =>
                        this.amountCurrencyService.toMajor(
                            balance.current,
                            balance.currency.symbolic_code,
                        ),
                    ),
                ),
            typeParameters: {
                currencyCode: (d) =>
                    this.getBalance(d.id).pipe(map((balance) => balance.currency.symbolic_code)),
            },
        },
        {
            field: 'expected_min',
            type: 'currency',
            lazy: true,
            formatter: (d) =>
                this.getBalance(d.id).pipe(
                    switchMap((balance) =>
                        this.amountCurrencyService.toMajor(
                            balance.expected_min,
                            balance.currency.symbolic_code,
                        ),
                    ),
                ),
            typeParameters: {
                currencyCode: (d) =>
                    this.getBalance(d.id).pipe(map((balance) => balance.currency.symbolic_code)),
            },
        },
    ];
    filters = this.fb.group<WalletParams>({
        party_id: null,
        identity_id: null,
        currency_code: null,
        wallet_id: null,
        ...this.qp.params,
    });

    constructor(
        private fetchWalletsService: FetchWalletsService,
        private qp: QueryParamsService<WalletParams>,
        private fb: FormBuilder,
        private walletManagementService: ManagementService,
        private log: NotifyLogService,
        private amountCurrencyService: AmountCurrencyService,
    ) {}

    ngOnInit() {
        this.filters.valueChanges
            .pipe(
                startWith(this.filters.value),
                map((v) => clean({ ...v, wallet_id: splitBySeparators(v.wallet_id) })),
                untilDestroyed(this),
            )
            .subscribe((value) => {
                void this.qp.set(value);
                this.search();
            });
    }

    search(size?: number) {
        const { wallet_id, ...v } = this.filters.value;
        this.fetchWalletsService.search(
            clean({ ...v, wallet_id: splitBySeparators(wallet_id) }),
            size,
        );
    }

    fetchMore() {
        this.fetchWalletsService.fetchMore();
    }

    @Memoize()
    getBalance(walletId: string) {
        return this.walletManagementService.GetAccountBalance(walletId).pipe(
            catchError((err) => {
                this.log.error(err);
                return of<Partial<AccountBalance>>({});
            }),
            shareReplay({ refCount: true, bufferSize: 1 }),
        );
    }
}
