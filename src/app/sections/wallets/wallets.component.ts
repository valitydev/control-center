import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { SearchWalletHit } from '@vality/deanonimus-proto/internal/deanonimus';
import { AccountBalance } from '@vality/fistful-proto/internal/account';
import { StatWallet } from '@vality/fistful-proto/internal/fistful_stat';
import {
    clean,
    Column,
    QueryParamsService,
    NotifyLogService,
    countProps,
    FiltersComponent,
    UpdateOptions,
    getValueChanges,
} from '@vality/ng-core';
import isNil from 'lodash-es/isNil';
import { of } from 'rxjs';
import { map, shareReplay, catchError, debounceTime } from 'rxjs/operators';
import { Memoize } from 'typescript-memoize';

import { WalletParams } from '@cc/app/api/fistful-stat/query-dsl/types/wallet';
import { ManagementService } from '@cc/app/api/wallet';

import { createCurrencyColumn, createPartyColumn } from '../../shared';
import { DEBOUNCE_TIME_MS } from '../../tokens';

import { FetchWalletsTextService } from './fetch-wallets-text.service';
import { FetchWalletsService } from './fetch-wallets.service';

@UntilDestroy()
@Component({
    selector: 'cc-wallets',
    templateUrl: './wallets.component.html',
    providers: [FetchWalletsService, FetchWalletsTextService],
})
export class WalletsComponent implements OnInit {
    isFilterControl = new FormControl(1);

    filterWallets$ = this.fetchWalletsService.result$;
    filtersLoading$ = this.fetchWalletsService.isLoading$;
    filterHasMore$ = this.fetchWalletsService.hasMore$;

    fullTextSearchWallets$ = this.fetchWalletsTextService.result$;
    fullTextSearchLoading$ = this.fetchWalletsTextService.isLoading$;

    filterColumns: Column<StatWallet>[] = [
        { field: 'id' },
        { field: 'name' },
        'currency_symbolic_code',
        'identity_id',
        { field: 'created_at', type: 'datetime' },
        createCurrencyColumn<StatWallet>(
            'balance',
            (d) => this.getBalance(d.id).pipe(map((b) => b.current)),
            (d) => this.getBalance(d.id).pipe(map((b) => b.currency.symbolic_code)),
            { lazy: true },
        ),
        createCurrencyColumn<StatWallet>(
            'hold',
            (d) => this.getBalance(d.id).pipe(map((b) => b.current - b.expected_min)),
            (d) => this.getBalance(d.id).pipe(map((b) => b.currency.symbolic_code)),
            { lazy: true },
        ),
        createCurrencyColumn<StatWallet>(
            'expected_min',
            (d) => this.getBalance(d.id).pipe(map((b) => b.expected_min)),
            (d) => this.getBalance(d.id).pipe(map((b) => b.currency.symbolic_code)),
            { lazy: true },
        ),
    ];
    fullTextSearchColumns: Column<SearchWalletHit>[] = [
        { field: 'wallet.id' },
        { field: 'wallet.name' },
        createPartyColumn<SearchWalletHit>(
            'party',
            (d) => d.party.id,
            (d) => d.party.email,
        ),
        createCurrencyColumn<SearchWalletHit>(
            'balance',
            (d) => this.getBalance(d.wallet.id).pipe(map((b) => b.current)),
            (d) => this.getBalance(d.wallet.id).pipe(map((b) => b.currency.symbolic_code)),
            { lazy: true },
        ),
        createCurrencyColumn<SearchWalletHit>(
            'hold',
            (d) => this.getBalance(d.wallet.id).pipe(map((b) => b.current - b.expected_min)),
            (d) => this.getBalance(d.wallet.id).pipe(map((b) => b.currency.symbolic_code)),
            { lazy: true },
        ),
        createCurrencyColumn<SearchWalletHit>(
            'expected_min',
            (d) => this.getBalance(d.wallet.id).pipe(map((b) => b.expected_min)),
            (d) => this.getBalance(d.wallet.id).pipe(map((b) => b.currency.symbolic_code)),
            { lazy: true },
        ),
    ];
    filtersForm = this.fb.group({
        party_id: null as string,
        identity_id: null as string,
        currency_code: null as string,
        wallet_id: [null as string[]],
    });
    active = 0;
    @ViewChild(FiltersComponent) filters!: FiltersComponent;
    typeQp = this.qp.createNamespace<{ isFilter: boolean }>('type');

    constructor(
        private fetchWalletsService: FetchWalletsService,
        private fetchWalletsTextService: FetchWalletsTextService,
        private qp: QueryParamsService<WalletParams>,
        private fb: FormBuilder,
        private walletManagementService: ManagementService,
        private log: NotifyLogService,
        @Inject(DEBOUNCE_TIME_MS) private debounceTimeMs: number,
    ) {}

    ngOnInit() {
        this.filtersForm.patchValue(this.qp.params);
        const isFilter = this.typeQp.params.isFilter;
        if (!isNil(isFilter)) {
            this.isFilterControl.setValue(Number(isFilter));
        }
        getValueChanges(this.isFilterControl)
            .pipe(untilDestroyed(this))
            .subscribe((value) => {
                void this.typeQp.set({ isFilter: !!value });
            });
        getValueChanges(this.filtersForm)
            .pipe(debounceTime(this.debounceTimeMs), untilDestroyed(this))
            .subscribe((value) => {
                void this.qp.set(clean(value));
                this.filterSearch();
            });
    }

    filterSearch(opts?: UpdateOptions) {
        const props = clean(this.filtersForm.value);
        this.fetchWalletsService.load(props, opts);
        this.active = countProps(props);
    }

    filterMore() {
        this.fetchWalletsService.more();
    }

    fullTextSearch(text: string) {
        this.fetchWalletsTextService.load(text);
    }

    fullTextSearchReload() {
        this.fetchWalletsTextService.reload();
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
