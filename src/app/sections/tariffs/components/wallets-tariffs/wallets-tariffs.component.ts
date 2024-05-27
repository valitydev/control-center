import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
    TermSetHierarchyRef,
    type CashFlowSelector,
    type CashFlowPosting,
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
} from '@vality/ng-core';
import { getUnionKey } from '@vality/ng-thrift';
import { map, shareReplay } from 'rxjs/operators';
import { WalletsTariffsService } from 'src/app/sections/tariffs/components/wallets-tariffs/wallets-tariffs.service';
import {
    DomainObjectCardComponent,
    getDomainObjectDetails,
} from 'src/app/shared/components/thrift-api-crud';
import { Overwrite } from 'utility-types';

import {
    createContractColumn,
    createPartyColumn,
    PageLayoutModule,
    formatCashVolume,
    formatPredicate,
    WalletFieldModule,
    createWalletColumn,
} from '@cc/app/shared';
import { CurrencyFieldComponent } from '@cc/app/shared/components/currency-field';
import { MerchantFieldModule } from '@cc/app/shared/components/merchant-field';
import { SidenavInfoService } from '@cc/app/shared/components/sidenav-info';
import { DEBOUNCE_TIME_MS } from '@cc/app/tokens';

type Params = Pick<CommonSearchQueryParams, 'currencies'> &
    Overwrite<
        Omit<WalletSearchQuery, 'common_search_query_params'>,
        { term_sets_ids?: TermSetHierarchyRef['id'][]; identity_ids?: IdentityProviderRef['id'][] }
    >;

function getViewedCashFlowSelectors(d: WalletTermSet) {
    return (
        d.current_term_set.data.term_sets
            ?.map?.((t) => t?.terms?.payments?.fees)
            ?.filter?.(Boolean) ?? []
    );
}

interface InlineCashFlowSelector {
    if?: string;
    value?: string;
    parent?: InlineCashFlowSelector;
    level: number;
}

function getInlineDecisions(
    d: CashFlowSelector[],
    filterValue: (v: CashFlowPosting) => boolean = (v) =>
        getUnionKey(v?.source) === 'merchant' && getUnionKey(v?.destination) === 'system',
    level = 0,
): InlineCashFlowSelector[] {
    return d.reduce((acc, c) => {
        if (c.value) {
            acc.push({
                value: c.value
                    .filter(filterValue)
                    .map((v) => formatCashVolume(v.volume))
                    .join(' + '),
                level,
            });
        }
        if (c.decisions?.length) {
            acc.push(
                ...c.decisions
                    .map((d) => {
                        const thenInlineDecisions = getInlineDecisions(
                            [d.then_],
                            filterValue,
                            level + 1,
                        );
                        if (d.if_) {
                            const ifInlineDecision = {
                                if: `${' '.repeat(level)}${
                                    formatPredicate(d.if_) || (level > 0 ? '↳' : '')
                                }`,
                                level,
                            };
                            return thenInlineDecisions.length > 1
                                ? [ifInlineDecision, ...thenInlineDecisions]
                                : [{ ...ifInlineDecision, value: thenInlineDecisions[0].value }];
                        }
                        return thenInlineDecisions;
                    })
                    .flat(),
            );
        }
        return acc;
    }, [] as InlineCashFlowSelector[]);
}

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
        createContractColumn<WalletTermSet>(
            (d) => d.contract_id,
            (d) => d.owner_id,
            (d) => d.wallet_id,
        ),
        { field: 'currency' },
        {
            field: 'current_term_set',
            formatter: (d) =>
                getDomainObjectDetails({ term_set_hierarchy: d.current_term_set })?.label,
            click: (d) =>
                this.sidenavInfoService.open(DomainObjectCardComponent, {
                    ref: { term_set_hierarchy: d?.current_term_set?.ref },
                }),
        },
        {
            field: 'decision',
            formatter: (d) => getInlineDecisions(getViewedCashFlowSelectors(d)).map((v) => v.if),
        },
        {
            field: 'value',
            formatter: (d) => getInlineDecisions(getViewedCashFlowSelectors(d)).map((v) => v.value),
        },
        {
            field: 'term_set_history',
            formatter: (d) => d.term_set_history?.length,
            tooltip: (d) => d.term_set_history,
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
