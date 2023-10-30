import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { AccountBalance } from '@vality/fistful-proto/internal/account';
import { StatWallet } from '@vality/fistful-proto/internal/fistful_stat';
import { clean, Column, QueryParamsService, NotifyLogService, countProps } from '@vality/ng-core';
import { of, switchMap } from 'rxjs';
import { startWith, map, shareReplay, catchError, debounceTime } from 'rxjs/operators';
import { Memoize } from 'typescript-memoize';

import { WalletParams } from '@cc/app/api/fistful-stat/query-dsl/types/wallet';
import { ManagementService } from '@cc/app/api/wallet';

import { AmountCurrencyService } from '../../shared/services';
import { DEBOUNCE_TIME_MS } from '../../tokens';

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
            field: 'hold',
            type: 'currency',
            lazy: true,
            formatter: (d) =>
                this.getBalance(d.id).pipe(
                    switchMap((balance) =>
                        this.amountCurrencyService.toMajor(
                            balance.current - balance.expected_min,
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
        {
            field: 'expected_max',
            type: 'currency',
            lazy: true,
            hide: true,
            formatter: (d) =>
                this.getBalance(d.id).pipe(
                    switchMap((balance) =>
                        this.amountCurrencyService.toMajor(
                            balance.expected_max,
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
    filtersForm = this.fb.group({
        party_id: null as string,
        identity_id: null as string,
        currency_code: null as string,
        wallet_id: [null as string[]],
    });
    active = 0;

    constructor(
        private fetchWalletsService: FetchWalletsService,
        private qp: QueryParamsService<WalletParams>,
        private fb: FormBuilder,
        private walletManagementService: ManagementService,
        private log: NotifyLogService,
        private amountCurrencyService: AmountCurrencyService,
        @Inject(DEBOUNCE_TIME_MS) private debounceTimeMs: number,
    ) {}

    ngOnInit() {
        this.filtersForm.patchValue(this.qp.params);
        this.filtersForm.valueChanges
            .pipe(
                startWith(this.filtersForm.value),
                debounceTime(this.debounceTimeMs),
                untilDestroyed(this),
            )
            .subscribe((value) => {
                void this.qp.set(clean(value));
                this.search();
            });
    }

    search(size?: number) {
        const props = clean(this.filtersForm.value);
        this.fetchWalletsService.search(props, size);
        this.active = countProps(props);
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
