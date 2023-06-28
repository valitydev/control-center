import { Component, OnInit } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { ChargebackSearchQuery } from '@vality/magista-proto/magista';
import {
    DateRange,
    clean,
    QueryParamsService,
    LoadOptions,
    getNoTimeZoneIsoString,
} from '@vality/ng-core';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import lodashMerge from 'lodash-es/merge';
import { merge, debounceTime } from 'rxjs';
import { startWith } from 'rxjs/operators';

import { FetchChargebacksService } from './fetch-chargebacks.service';

@UntilDestroy()
@Component({
    selector: 'cc-chargebacks',
    templateUrl: './chargebacks.component.html',
    styles: [],
})
export class ChargebacksComponent implements OnInit {
    active = 0;
    filtersForm = this.fb.group({
        dateRange: {
            start: subDays(startOfDay(new Date()), 1),
            end: endOfDay(new Date()),
        },
        party_id: undefined as string,
        shop_ids: [undefined as string[]],
    });
    otherFiltersControl = this.fb.control(undefined);
    chargebacks$ = this.fetchChargebacksService.result$;
    isLoading$ = this.fetchChargebacksService.isLoading$;
    hasMore$ = this.fetchChargebacksService.hasMore$;

    constructor(
        private fb: NonNullableFormBuilder,
        private qp: QueryParamsService<{
            filters: object;
            otherFilters: object;
            dateRange: DateRange;
        }>,
        private fetchChargebacksService: FetchChargebacksService
    ) {}

    ngOnInit() {
        this.filtersForm.patchValue(
            lodashMerge({}, this.qp.params.filters, clean({ dateRange: this.qp.params.dateRange }))
        );
        const otherFilters = this.otherFiltersControl.value;
        const otherFiltersParams: Partial<ChargebackSearchQuery> =
            this.qp.params.otherFilters || {};
        this.otherFiltersControl.patchValue(lodashMerge({}, otherFilters, otherFiltersParams));
        merge(this.filtersForm.valueChanges, this.otherFiltersControl.valueChanges)
            .pipe(startWith(null), debounceTime(500), untilDestroyed(this))
            .subscribe(() => {
                this.load();
            });
    }

    more() {
        this.fetchChargebacksService.more();
    }

    load(options?: LoadOptions) {
        const { dateRange, ...filters } = clean(this.filtersForm.value);
        const otherFilters = clean(this.otherFiltersControl.value);
        void this.qp.set({ filters, otherFilters, dateRange });
        this.fetchChargebacksService.load(
            clean({
                ...otherFilters,
                common_search_query_params: {
                    ...(otherFilters.common_search_query_params || {}),
                    party_id: filters.party_id,
                    shop_ids: filters.shop_ids,
                    from_time: getNoTimeZoneIsoString(dateRange.start),
                    to_time: getNoTimeZoneIsoString(endOfDay(dateRange.end)),
                },
            }),
            options
        );
        this.active =
            Object.keys(dateRange).length +
            Object.keys(filters).length +
            Object.keys(otherFilters.payment_params || {}).length +
            Object.keys(otherFilters.common_search_query_params || {}).length;
    }
}
