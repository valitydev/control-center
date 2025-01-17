import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import {
    type IdentityProviderRef,
    TermSetHierarchyRef,
} from '@vality/domain-proto/internal/domain';
import {
    CommonSearchQueryParams,
    type WalletSearchQuery,
    type WalletTermSet,
} from '@vality/dominator-proto/internal/dominator';
import {
    Column,
    FiltersModule,
    InputFieldModule,
    ListFieldModule,
    LoadOptions,
    QueryParamsService,
    TableModule,
    UpdateOptions,
    VSelectPipe,
    cachedHeadMap,
    clean,
    countChanged,
    createControls,
    debounceTimeWithFirst,
    getValueChanges,
} from '@vality/matez';
import { map, shareReplay } from 'rxjs/operators';
import { Overwrite } from 'utility-types';

import {
    PageLayoutModule,
    WalletFieldModule,
    createDomainObjectColumn,
    createPartyColumn,
    createWalletColumn,
} from '../../../../shared';
import { CurrencyFieldComponent } from '../../../../shared/components/currency-field/currency-field.component';
import { MerchantFieldModule } from '../../../../shared/components/merchant-field/merchant-field.module';
import { SidenavInfoService } from '../../../../shared/components/sidenav-info/sidenav-info.service';
import { DEBOUNCE_TIME_MS } from '../../../../tokens';
import { FlatDecision, getFlatDecisions } from '../../utils/get-flat-decisions';
import { WalletsTermSetHistoryCardComponent } from '../wallets-term-set-history-card';

import {
    WALLET_FEES_COLUMNS,
    getWalletCashFlowSelectors,
    isWalletTermSetDecision,
} from './utils/wallet-fees-columns';
import { WalletsTermsService } from './wallets-terms.service';

type Params = Pick<CommonSearchQueryParams, 'currencies'> &
    Overwrite<
        Omit<WalletSearchQuery, 'common_search_query_params'>,
        { term_sets_ids?: TermSetHierarchyRef['id'][]; identity_ids?: IdentityProviderRef['id'][] }
    >;

@Component({
    selector: 'cc-wallets-terms',
    imports: [
        CommonModule,
        PageLayoutModule,
        TableModule,
        InputFieldModule,
        FiltersModule,
        ReactiveFormsModule,
        MerchantFieldModule,
        ListFieldModule,
        CurrencyFieldComponent,
        WalletFieldModule,
        MatTooltip,
        VSelectPipe,
    ],
    templateUrl: './wallets-terms.component.html',
})
export class WalletsTermsComponent implements OnInit {
    filtersForm = this.fb.group(
        createControls<Params>({
            currencies: null,
            party_id: null,
            wallet_ids: null,
            term_sets_names: null,
            term_sets_ids: null,
            identity_ids: null,
        }),
    );
    terms$ = this.walletsTermsService.result$.pipe(
        cachedHeadMap((t) => ({
            value: t,
            children: getFlatDecisions(getWalletCashFlowSelectors(t.current_term_set)).filter((v) =>
                isWalletTermSetDecision(v, {
                    partyId: t.owner_id,
                    walletId: t.wallet_id,
                    currency: t.currency,
                }),
            ),
        })),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    hasMore$ = this.walletsTermsService.hasMore$;
    isLoading$ = this.walletsTermsService.isLoading$;
    columns: Column<WalletTermSet, FlatDecision>[] = [
        createWalletColumn((d) => ({ id: d.wallet_id, name: d.wallet_name, partyId: d.owner_id }), {
            sticky: 'start',
        }),
        createPartyColumn((d) => ({ id: d.owner_id })),
        { field: 'contract_id', header: 'Contract' },
        { field: 'identity_id.id', header: 'Identity' },
        { field: 'currency' },
        createDomainObjectColumn((d) => ({ ref: { term_set_hierarchy: d.current_term_set.ref } }), {
            header: 'Term Set',
        }),
        ...WALLET_FEES_COLUMNS,
        {
            field: 'term_set_history',
            cell: (d) => ({
                value: d.term_set_history?.length || '',
                click: () =>
                    this.sidenavInfoService.open(WalletsTermSetHistoryCardComponent, { data: d }),
            }),
        },
    ];
    active$ = getValueChanges(this.filtersForm).pipe(
        map((filters) => countChanged(this.initFiltersValue, filters)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    private initFiltersValue = this.filtersForm.value;

    constructor(
        private walletsTermsService: WalletsTermsService,
        private fb: NonNullableFormBuilder,
        private qp: QueryParamsService<Params>,
        @Inject(DEBOUNCE_TIME_MS) private debounceTimeMs: number,
        private dr: DestroyRef,
        private sidenavInfoService: SidenavInfoService,
    ) {}

    ngOnInit() {
        this.filtersForm.patchValue(this.qp.params);
        getValueChanges(this.filtersForm)
            .pipe(debounceTimeWithFirst(this.debounceTimeMs), takeUntilDestroyed(this.dr))
            .subscribe((filters) => {
                void this.qp.set(filters);
                this.load(filters);
            });
    }

    load(params: Params, options?: LoadOptions) {
        const { currencies, term_sets_ids, identity_ids, ...otherParams } = params;
        this.walletsTermsService.load(
            clean({
                common_search_query_params: { currencies },
                term_sets_ids: term_sets_ids?.map?.((id) => ({ id })),
                identity_ids: identity_ids?.map?.((id) => ({ id })),
                ...otherParams,
            }),
            options,
        );
    }

    update(options?: UpdateOptions) {
        this.walletsTermsService.reload(options);
    }

    more() {
        this.walletsTermsService.more();
    }
}
