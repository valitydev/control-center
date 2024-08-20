import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import {
    TermSetHierarchyRef,
    type IdentityProviderRef,
} from '@vality/domain-proto/internal/domain';
import {
    CommonSearchQueryParams,
    type WalletTermSet,
    type WalletSearchQuery,
} from '@vality/dominator-proto/internal/dominator';
import {
    clean,
    countChanged,
    createControls,
    debounceTimeWithFirst,
    FiltersModule,
    getValueChanges,
    InputFieldModule,
    ListFieldModule,
    LoadOptions,
    QueryParamsService,
    TableModule,
    UpdateOptions,
    VSelectPipe,
    Column2,
} from '@vality/ng-core';
import { map, shareReplay } from 'rxjs/operators';
import { Overwrite } from 'utility-types';

import { PageLayoutModule, WalletFieldModule } from '@cc/app/shared';
import { CurrencyFieldComponent } from '@cc/app/shared/components/currency-field';
import { MerchantFieldModule } from '@cc/app/shared/components/merchant-field';
import { SidenavInfoService } from '@cc/app/shared/components/sidenav-info';
import {
    createDomainObjectColumn,
    createPartyColumn,
    createWalletColumn,
} from '@cc/app/shared/utils/table2';
import { DEBOUNCE_TIME_MS } from '@cc/app/tokens';

import { InlineDecision2, getInlineDecisions2 } from '../../utils/get-inline-decisions';
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
    selector: 'cc-wallets-tariffs',
    standalone: true,
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
    tariffs$ = this.walletsTariffsService.result$.pipe(
        map((terms) =>
            terms.map((t) => ({
                value: t,
                children: getInlineDecisions2(
                    getWalletCashFlowSelectors(t.current_term_set),
                ).filter((v) =>
                    isWalletTermSetDecision(v, {
                        partyId: t.owner_id,
                        walletId: t.wallet_id,
                        currency: t.currency,
                    }),
                ),
            })),
        ),
    );
    hasMore$ = this.walletsTariffsService.hasMore$;
    isLoading$ = this.walletsTariffsService.isLoading$;
    columns: Column2<WalletTermSet, InlineDecision2>[] = [
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
        private walletsTariffsService: WalletsTermsService,
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
        this.walletsTariffsService.load(
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
        this.walletsTariffsService.reload(options);
    }

    more() {
        this.walletsTariffsService.more();
    }
}
