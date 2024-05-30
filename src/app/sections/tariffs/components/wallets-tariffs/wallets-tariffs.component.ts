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
    Column,
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
} from '@vality/ng-core';
import { map, shareReplay } from 'rxjs/operators';
import { Overwrite } from 'utility-types';

import {
    createPartyColumn,
    PageLayoutModule,
    WalletFieldModule,
    createWalletColumn,
} from '@cc/app/shared';
import { CurrencyFieldComponent } from '@cc/app/shared/components/currency-field';
import { MerchantFieldModule } from '@cc/app/shared/components/merchant-field';
import { SidenavInfoService } from '@cc/app/shared/components/sidenav-info';
import {
    DomainObjectCardComponent,
    getDomainObjectDetails,
} from '@cc/app/shared/components/thrift-api-crud';
import { createDomainObjectColumn } from '@cc/app/shared/utils/table/create-domain-object-column';
import { DEBOUNCE_TIME_MS } from '@cc/app/tokens';

import { WalletsTermSetHistoryCardComponent } from '../wallets-term-set-history-card';

import { createWalletFeesColumn } from './utils/create-wallet-fees-column';
import { WalletsTariffsService } from './wallets-tariffs.service';

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
    templateUrl: './wallets-tariffs.component.html',
})
export class WalletsTariffsComponent implements OnInit {
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
    tariffs$ = this.walletsTariffsService.result$;
    hasMore$ = this.walletsTariffsService.hasMore$;
    isLoading$ = this.walletsTariffsService.isLoading$;
    columns: Column<WalletTermSet>[] = [
        createWalletColumn<WalletTermSet>(
            'wallet_id',
            (d) => d.owner_id,
            undefined,
            (d) => d.wallet_name,
            {
                pinned: 'left',
            },
        ),
        createPartyColumn<WalletTermSet>('owner_id'),
        { field: 'contract_id', header: 'Contract' },
        { field: 'identity_id.id', header: 'Identity' },
        { field: 'currency' },
        {
            field: 'term_set',
            formatter: (d) =>
                getDomainObjectDetails({ term_set_hierarchy: d.current_term_set })?.label,
            click: (d) =>
                this.sidenavInfoService.open(DomainObjectCardComponent, {
                    ref: { term_set_hierarchy: d?.current_term_set?.ref },
                }),
        },
        createDomainObjectColumn('term_set_hierarchy', (d) => d.current_term_set.ref),
        ...createWalletFeesColumn<WalletTermSet>(
            (d) => d.current_term_set,
            (d) => d.wallet_id,
        ),
        {
            field: 'term_set_history',
            formatter: (d) => d.term_set_history?.length || '',
            click: (d) =>
                this.sidenavInfoService.open(WalletsTermSetHistoryCardComponent, {
                    data: d?.term_set_history?.reverse(),
                    walletId: d?.wallet_id,
                }),
        },
    ];
    active$ = getValueChanges(this.filtersForm).pipe(
        map((filters) => countChanged(this.initFiltersValue, filters)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    private initFiltersValue = this.filtersForm.value;

    constructor(
        private walletsTariffsService: WalletsTariffsService,
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
                term_sets_ids: term_sets_ids?.map((id) => ({ id })),
                identity_ids: identity_ids?.map((id) => ({ id })),
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
