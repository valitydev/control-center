import { Component, DestroyRef, Inject, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, NonNullableFormBuilder } from '@angular/forms';
import { SearchWalletHit } from '@vality/deanonimus-proto/internal/deanonimus';
import { IdentityState } from '@vality/fistful-proto/identity';
import { AccountBalance } from '@vality/fistful-proto/internal/account';
import { StatWallet } from '@vality/fistful-proto/internal/fistful_stat';
import {
    Column,
    DebounceTime,
    FiltersComponent,
    QueryParamsService,
    UpdateOptions,
    clean,
    countChanged,
    debounceTimeWithFirst,
    getValueChanges,
} from '@vality/matez';
import isNil from 'lodash-es/isNil';
import { combineLatest, of } from 'rxjs';
import { catchError, map, shareReplay, take } from 'rxjs/operators';
import { MemoizeExpiring } from 'typescript-memoize';

import { WalletParams } from '../../api/fistful-stat/query-dsl/types/wallet';
import { IdentityManagementService } from '../../api/identity';
import { ManagementService } from '../../api/wallet/management.service';
import { createCurrencyColumn, createPartyColumn } from '../../shared';
import { DEBOUNCE_TIME_MS } from '../../tokens';
import { PartyStoreService } from '../party';

import { FetchWalletsTextService } from './fetch-wallets-text.service';
import { FetchWalletsService } from './fetch-wallets.service';

@Component({
    selector: 'cc-wallets',
    templateUrl: './wallets.component.html',
    providers: [FetchWalletsService, FetchWalletsTextService, PartyStoreService],
    standalone: false,
})
export class WalletsComponent implements OnInit {
    isFilterControl = new FormControl(0);

    filterWallets$ = this.fetchWalletsService.result$;
    filtersLoading$ = this.fetchWalletsService.isLoading$;
    filterHasMore$ = this.fetchWalletsService.hasMore$;

    fullTextSearchWallets$ = this.fetchWalletsTextService.result$;
    fullTextSearchLoading$ = this.fetchWalletsTextService.isLoading$;

    filterColumns: Column<StatWallet>[] = [
        { field: 'id' },
        { field: 'name' },
        { field: 'currency_symbolic_code' },
        { field: 'identity_id' },
        { field: 'created_at', cell: { type: 'datetime' } },
        createCurrencyColumn(
            (d) =>
                this.getBalance(d.id).pipe(
                    map((b) => ({ amount: b.current, code: b.currency.symbolic_code })),
                ),
            { header: 'Balance', isLazyCell: true },
        ),
        createCurrencyColumn(
            (d) =>
                this.getBalance(d.id).pipe(
                    map((b) => ({
                        amount: b.current - b.expected_min,
                        code: b.currency.symbolic_code,
                    })),
                ),
            { header: 'Hold', isLazyCell: true },
        ),
        createCurrencyColumn(
            (d) =>
                this.getBalance(d.id).pipe(
                    map((b) => ({ amount: b.expected_min, code: b.currency.symbolic_code })),
                ),
            { header: 'Expected Min', isLazyCell: true },
        ),
        {
            field: 'contract_id',
            lazyCell: (d) =>
                this.getIdentity(d.identity_id).pipe(
                    map((identity) => ({ value: identity.contract_id })),
                ),
        },
        createPartyColumn(
            (d) =>
                this.getIdentity(d.identity_id).pipe(
                    map((identity) => ({ id: identity.party_id })),
                ),
            { hidden: this.partyStoreService.party$.pipe(map((p) => !p)) },
        ),
    ];
    fullTextSearchColumns: Column<SearchWalletHit>[] = [
        { field: 'wallet.id' },
        { field: 'wallet.name' },
        createPartyColumn((d) => ({
            id: d.party.id,
            partyName: d.party.email,
        })),
        createCurrencyColumn(
            (d) =>
                this.getBalance(d.wallet.id).pipe(
                    map((b) => ({ amount: b.current, code: b.currency.symbolic_code })),
                ),
            { header: 'Balance', isLazyCell: true },
        ),
        createCurrencyColumn(
            (d) =>
                this.getBalance(d.wallet.id).pipe(
                    map((b) => ({
                        amount: b.current - b.expected_min,
                        code: b.currency.symbolic_code,
                    })),
                ),
            { header: 'Hold', isLazyCell: true },
        ),
        createCurrencyColumn(
            (d) =>
                this.getBalance(d.wallet.id).pipe(
                    map((b) => ({ amount: b.expected_min, code: b.currency.symbolic_code })),
                ),
            { header: 'Expected Min', isLazyCell: true },
        ),
    ];
    filtersForm = this.fb.group({
        party_id: null as string,
        identity_id: null as string,
        currency_code: null as string,
        wallet_id: [null as string[]],
    });
    active$ = getValueChanges(this.filtersForm).pipe(
        map((v) => countChanged(this.initFilters, v)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    @ViewChild(FiltersComponent) filters!: FiltersComponent;
    typeQp = this.qp.createNamespace<{ isFilter: boolean }>('type');
    party$ = this.partyStoreService.party$;
    isFilterTable$ = combineLatest([getValueChanges(this.isFilterControl), this.party$]).pipe(
        map(([isFilterControl, party]) => isFilterControl || !!party),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    private initFilters = this.filtersForm.value;

    constructor(
        private fetchWalletsService: FetchWalletsService,
        private fetchWalletsTextService: FetchWalletsTextService,
        private qp: QueryParamsService<WalletParams>,
        private fb: NonNullableFormBuilder,
        private walletManagementService: ManagementService,
        @Inject(DEBOUNCE_TIME_MS) private debounceTimeMs: number,
        private destroyRef: DestroyRef,
        private identityManagementService: IdentityManagementService,
        private partyStoreService: PartyStoreService,
    ) {}

    ngOnInit() {
        this.filtersForm.patchValue(this.qp.params);
        const isFilter = this.typeQp.params.isFilter;
        if (!isNil(isFilter)) {
            this.isFilterControl.setValue(Number(isFilter));
        }
        getValueChanges(this.isFilterControl)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((value) => {
                void this.typeQp.set({ isFilter: !!value });
            });
        getValueChanges(this.filtersForm)
            .pipe(debounceTimeWithFirst(this.debounceTimeMs), takeUntilDestroyed(this.destroyRef))
            .subscribe((value) => {
                void this.qp.set(clean(value));
                this.filterSearch();
            });
    }

    filterSearch(opts?: UpdateOptions) {
        const props = clean(this.filtersForm.value);
        this.partyStoreService.party$.pipe(take(1)).subscribe((p) => {
            this.fetchWalletsService.load(
                clean({
                    party_id: p ? p.id : undefined,
                    ...props,
                }),
                opts,
            );
        });
    }

    filterMore() {
        this.fetchWalletsService.more();
    }

    @DebounceTime()
    fullTextSearch(text: string) {
        this.fetchWalletsTextService.load(text);
    }

    fullTextSearchReload() {
        this.fetchWalletsTextService.reload();
    }

    @MemoizeExpiring(5 * 60_000)
    getBalance(walletId: string) {
        return this.walletManagementService.GetAccountBalance(walletId).pipe(
            catchError((err) => {
                console.error(err);
                return of<Partial<AccountBalance>>({});
            }),
            shareReplay({ refCount: true, bufferSize: 1 }),
        );
    }

    @MemoizeExpiring(5 * 60_000)
    getIdentity(id: string) {
        return this.identityManagementService.Get(id, {}).pipe(
            catchError((err) => {
                console.error(err);
                return of<Partial<IdentityState>>({});
            }),
            shareReplay({ refCount: true, bufferSize: 1 }),
        );
    }
}
