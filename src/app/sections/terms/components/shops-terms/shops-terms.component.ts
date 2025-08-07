import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TermSetHierarchyRef } from '@vality/domain-proto/domain';
import {
    CommonSearchQueryParams,
    ShopSearchQuery,
    ShopTermSet,
} from '@vality/dominator-proto/dominator';
import {
    Column,
    FiltersModule,
    InputFieldModule,
    ListFieldModule,
    LoadOptions,
    QueryParamsService,
    TableModule,
    UpdateOptions,
    cachedHeadMap,
    clean,
    countChanged,
    createControls,
    debounceTimeWithFirst,
    getValueChanges,
} from '@vality/matez';
import { map, shareReplay } from 'rxjs/operators';
import { Overwrite } from 'utility-types';

import { PageLayoutModule, ShopFieldModule } from '../../../../shared';
import {
    createDomainObjectColumn,
    createPartyColumn,
    createShopColumn,
} from '../../../../../utils';
import { MerchantFieldModule } from '../../../../shared/components/merchant-field/merchant-field.module';
import { SidenavInfoService } from '../../../../shared/components/sidenav-info/sidenav-info.service';
import { DEBOUNCE_TIME_MS } from '../../../../tokens';
import { FlatDecision, getFlatDecisions } from '../../utils/get-flat-decisions';
import { ShopsTermSetHistoryCardComponent } from '../shops-term-set-history-card';

import { ShopsTermsService } from './shops-terms.service';
import {
    SHOP_FEES_COLUMNS,
    getShopCashFlowSelectors,
    isShopTermSetDecision,
} from './utils/shop-fees-columns';

type Params = Pick<CommonSearchQueryParams, 'currencies'> &
    Overwrite<
        Omit<ShopSearchQuery, 'common_search_query_params'>,
        { term_sets_ids?: TermSetHierarchyRef['id'][] }
    >;

@Component({
    selector: 'cc-shops-terms',
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
    ],
    templateUrl: './shops-terms.component.html',
})
export class ShopsTermsComponent implements OnInit {
    private shopsTermsService = inject(ShopsTermsService);
    private fb = inject(NonNullableFormBuilder);
    private qp = inject<QueryParamsService<Params>>(QueryParamsService<Params>);
    private debounceTimeMs = inject<number>(DEBOUNCE_TIME_MS);
    private dr = inject(DestroyRef);
    private sidenavInfoService = inject(SidenavInfoService);

    filtersForm = this.fb.group(
        createControls<Params>({
            currencies: null,
            party_id: null,
            shop_ids: null,
            term_sets_names: null,
            term_sets_ids: null,
        }),
    );
    terms$ = this.shopsTermsService.result$.pipe(
        cachedHeadMap((t) => ({
            value: t,
            children: getFlatDecisions(getShopCashFlowSelectors(t.current_term_set)).filter((v) =>
                isShopTermSetDecision(v, {
                    partyId: t.owner_id,
                    shopId: t.shop_id,
                    currency: t.currency,
                }),
            ),
        })),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    hasMore$ = this.shopsTermsService.hasMore$;
    isLoading$ = this.shopsTermsService.isLoading$;
    columns: Column<ShopTermSet, FlatDecision>[] = [
        createShopColumn(
            (d) => ({
                shopId: d.shop_id,
                partyId: d.owner_id,
                shopName: d.shop_name,
            }),
            { sticky: 'start' },
        ),
        createPartyColumn((d) => ({ id: d.owner_id })),
        { field: 'currency' },
        createDomainObjectColumn((d) => ({ ref: { term_set_hierarchy: d.current_term_set.ref } }), {
            header: 'Term Set',
        }),
        ...SHOP_FEES_COLUMNS,
        {
            field: 'term_set_history',
            cell: (d) => ({
                value: d.term_set_history?.length || '',
                click: () =>
                    this.sidenavInfoService.open(ShopsTermSetHistoryCardComponent, { data: d }),
            }),
        },
    ];
    active$ = getValueChanges(this.filtersForm).pipe(
        map((filters) => countChanged(this.initFiltersValue, filters)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    private initFiltersValue = this.filtersForm.value;

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
        this.shopsTermsService.load(
            clean({
                common_search_query_params: { currencies },
                term_sets_ids: term_sets_ids?.map?.((id) => ({ id })),
                ...otherParams,
            }),
            options,
        );
    }

    update(options?: UpdateOptions) {
        this.shopsTermsService.reload(options);
    }

    more() {
        this.shopsTermsService.more();
    }
}
