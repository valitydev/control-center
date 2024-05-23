import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Inject, OnInit, viewChild, type TemplateRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TermSetHierarchyRef } from '@vality/domain-proto/internal/domain';
import {
    CommonSearchQueryParams,
    ShopSearchQuery,
    ShopTermSet,
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
import { Overwrite } from 'utility-types';

import {
    createContractColumn,
    createPartyColumn,
    createShopColumn,
    PageLayoutModule,
    ShopFieldModule,
    formatCashVolume,
} from '@cc/app/shared';
import { CurrencyFieldComponent } from '@cc/app/shared/components/currency-field';
import { MerchantFieldModule } from '@cc/app/shared/components/merchant-field';
import { SidenavInfoService } from '@cc/app/shared/components/sidenav-info';
import { DEBOUNCE_TIME_MS } from '@cc/app/tokens';

import { formatCashFlowDecisions } from '../cash-flows-selector-table/format-cash-flow.decisions';

import { ShopsTariffsService } from './shops-tariffs.service';

type Params = Pick<CommonSearchQueryParams, 'currencies'> &
    Overwrite<
        Omit<ShopSearchQuery, 'common_search_query_params'>,
        { term_sets_ids?: TermSetHierarchyRef['id'][] }
    >;

function getViewedCashFlowSelectors(d: ShopTermSet) {
    return (
        d.current_term_set.data.term_sets
            ?.map?.((t) => t?.terms?.payments?.fees)
            ?.filter?.(Boolean) ?? []
    );
}

@Component({
    selector: 'cc-shops-tariffs',
    standalone: true,
    imports: [
        CommonModule,
        PageLayoutModule,
        TableModule,
        InputFieldModule,
        FiltersModule,
        ReactiveFormsModule,
        MerchantFieldModule,
        ShopFieldModule,
        ListFieldModule,
        CurrencyFieldComponent,
    ],
    templateUrl: './shops-tariffs.component.html',
})
export class ShopsTariffsComponent implements OnInit {
    filtersForm = this.fb.group(
        createControls<Params>({
            currencies: null,
            party_id: null,
            shop_ids: null,
            term_sets_names: null,
            term_sets_ids: null,
        }),
    );
    tariffs$ = this.shopsTariffsService.result$;
    hasMore$ = this.shopsTariffsService.hasMore$;
    isLoading$ = this.shopsTariffsService.isLoading$;
    arrayColumnTemplate = viewChild<TemplateRef<unknown>>('arrayColumnTemplate');
    columns: Column<ShopTermSet>[] = [
        createShopColumn<ShopTermSet>('shop_id', (d) => d.owner_id),
        createPartyColumn<ShopTermSet>('owner_id'),
        createContractColumn<ShopTermSet>(
            (d) => d.contract_id,
            (d) => d.owner_id,
            (d) => d.shop_id,
        ),
        { field: 'currency' },
        {
            field: 'current_term_set',
            formatter: (d) =>
                d.current_term_set?.data?.name ||
                d.current_term_set?.data?.description ||
                (d.current_term_set?.ref?.id ? `#${d.current_term_set?.ref?.id}` : ''),
            description: (d) => d.current_term_set?.data?.description,
            // tooltip: (d) => d.current_term_set,
            // click: (d) =>
            //     this.sidenavInfoService.open(TermsetsCardComponent, {
            //         data: d?.current_term_set,
            //     }),
        },
        {
            field: 'decisions',
            formatter: (d) =>
                getViewedCashFlowSelectors(d).map((f) => formatCashFlowDecisions(f?.decisions)),
            cellTemplate: this.arrayColumnTemplate(),
        },
        {
            field: 'value',
            formatter: (d) =>
                getViewedCashFlowSelectors(d).map(
                    (f) =>
                        f?.value
                            ?.filter(
                                (c) =>
                                    getUnionKey(c?.source) === 'merchant' &&
                                    getUnionKey(c?.destination) === 'system',
                            )
                            ?.sort()
                            ?.map((c) => formatCashVolume(c.volume))
                            .join(' + '),
                ),
            cellTemplate: this.arrayColumnTemplate(),
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
        private shopsTariffsService: ShopsTariffsService,
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
        const { currencies, term_sets_ids, ...otherParams } = params;
        this.shopsTariffsService.load(
            clean({
                common_search_query_params: { currencies },
                term_sets_ids: term_sets_ids?.map((id) => ({ id })),
                ...otherParams,
            }),
            options,
        );
    }

    update(options?: UpdateOptions) {
        this.shopsTariffsService.reload(options);
    }

    more() {
        this.shopsTariffsService.more();
    }
}
