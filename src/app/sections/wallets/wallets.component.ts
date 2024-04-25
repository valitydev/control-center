import {
    Component,
    OnInit,
    Inject,
    ViewChild,
    DestroyRef,
    Injector,
    runInInjectionContext,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl } from '@angular/forms';
import { SearchWalletHit } from '@vality/deanonimus-proto/internal/deanonimus';
import { IdentityState } from '@vality/fistful-proto/identity';
import { AccountBalance } from '@vality/fistful-proto/internal/account';
import { StatWallet } from '@vality/fistful-proto/internal/fistful_stat';
import {
    clean,
    Column,
    QueryParamsService,
    NotifyLogService,
    FiltersComponent,
    UpdateOptions,
    getValueChanges,
    countChanged,
    debounceTimeWithFirst,
} from '@vality/ng-core';
import isNil from 'lodash-es/isNil';
import { of } from 'rxjs';
import { map, shareReplay, catchError, take } from 'rxjs/operators';
import { MemoizeExpiring } from 'typescript-memoize';

import { WalletParams } from '@cc/app/api/fistful-stat/query-dsl/types/wallet';
import { ManagementService } from '@cc/app/api/wallet';

import { IdentityManagementService } from '../../api/identity';
import { createCurrencyColumn, createPartyColumn } from '../../shared';
import { DEBOUNCE_TIME_MS } from '../../tokens';
import { PartyStoreService } from '../party';

import { FetchWalletsTextService } from './fetch-wallets-text.service';
import { FetchWalletsService } from './fetch-wallets.service';

@Component({
    selector: 'cc-wallets',
    templateUrl: './wallets.component.html',
    providers: [FetchWalletsService, FetchWalletsTextService, PartyStoreService],
})
export class WalletsComponent implements OnInit {
    isFilterControl = new FormControl(1);

    filterWallets$ = this.fetchWalletsService.result$;
    filtersLoading$ = this.fetchWalletsService.isLoading$;
    filterHasMore$ = this.fetchWalletsService.hasMore$;

    fullTextSearchWallets$ = this.fetchWalletsTextService.result$;
    fullTextSearchLoading$ = this.fetchWalletsTextService.isLoading$;

    filterColumns$ = this.partyStoreService.party$.pipe(
        map((party) =>
            runInInjectionContext(this.injector, () => [
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
                {
                    field: 'contract_id',
                    formatter: (d) =>
                        this.getIdentity(d.identity_id).pipe(
                            map((identity) => identity.contract_id),
                        ),
                    lazy: true,
                },
                ...(party
                    ? []
                    : [
                          createPartyColumn<StatWallet>(
                              'party',
                              (d) =>
                                  this.getIdentity(d.identity_id).pipe(
                                      map((identity) => identity.party_id),
                                  ),
                              undefined,
                              { lazy: true },
                          ),
                      ]),
            ]),
        ),
    );
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
    active$ = getValueChanges(this.filtersForm).pipe(
        map((v) => countChanged(this.initFilters, v)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    @ViewChild(FiltersComponent) filters!: FiltersComponent;
    typeQp = this.qp.createNamespace<{ isFilter: boolean }>('type');
    party$ = this.partyStoreService.party$;

    private initFilters = this.filtersForm.value;

    constructor(
        private fetchWalletsService: FetchWalletsService,
        private fetchWalletsTextService: FetchWalletsTextService,
        private qp: QueryParamsService<WalletParams>,
        private fb: FormBuilder,
        private walletManagementService: ManagementService,
        private log: NotifyLogService,
        @Inject(DEBOUNCE_TIME_MS) private debounceTimeMs: number,
        private destroyRef: DestroyRef,
        private identityManagementService: IdentityManagementService,
        private partyStoreService: PartyStoreService,
        private injector: Injector,
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
                this.log.error(err);
                return of<Partial<AccountBalance>>({});
            }),
            shareReplay({ refCount: true, bufferSize: 1 }),
        );
    }

    @MemoizeExpiring(5 * 60_000)
    getIdentity(id: string) {
        return this.identityManagementService.Get(id, {}).pipe(
            catchError((err) => {
                this.log.error(err);
                return of<Partial<IdentityState>>({});
            }),
            shareReplay({ refCount: true, bufferSize: 1 }),
        );
    }
}
