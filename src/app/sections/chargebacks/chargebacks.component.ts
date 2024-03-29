import { Component, OnInit, Inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder } from '@angular/forms';
import { ChargebackSearchQuery, StatChargeback } from '@vality/magista-proto/magista';
import {
    DateRange,
    clean,
    QueryParamsService,
    LoadOptions,
    getNoTimeZoneIsoString,
    createDateRangeToToday,
    isEqualDateRange,
    countProps,
    DialogService,
    DialogResponseStatus,
} from '@vality/ng-core';
import { endOfDay } from 'date-fns';
import merge from 'lodash-es/merge';
import { debounceTime, filter } from 'rxjs';
import { startWith } from 'rxjs/operators';

import {
    CHARGEBACK_STATUSES,
    CHARGEBACK_STAGES,
    CHARGEBACK_CATEGORIES,
} from '@cc/app/api/fistful-stat';

import { createUnion } from '../../../utils';
import { ChangeChargebacksStatusDialogComponent } from '../../shared/components/change-chargebacks-status-dialog';
import { DATE_RANGE_DAYS } from '../../tokens';

import { CreateChargebacksByFileDialogComponent } from './components/create-chargebacks-by-file-dialog/create-chargebacks-by-file-dialog.component';
import { FetchChargebacksService } from './fetch-chargebacks.service';

@Component({
    selector: 'cc-chargebacks',
    templateUrl: './chargebacks.component.html',
    styles: [],
})
export class ChargebacksComponent implements OnInit {
    active = 0;
    filtersForm = this.fb.group({
        dateRange: createDateRangeToToday(this.dateRangeDays),
        party_id: undefined as ChargebackSearchQuery['common_search_query_params']['party_id'],
        shop_ids: [undefined as ChargebackSearchQuery['common_search_query_params']['shop_ids']],
        invoice_ids: [undefined as ChargebackSearchQuery['invoice_ids']],
        chargeback_ids: [undefined as ChargebackSearchQuery['chargeback_ids']],
        chargeback_statuses: [undefined as string[]],
        chargeback_stages: [undefined as string[]],
        chargeback_categories: [undefined as string[]],
    });
    chargebacks$ = this.fetchChargebacksService.result$;
    isLoading$ = this.fetchChargebacksService.isLoading$;
    hasMore$ = this.fetchChargebacksService.hasMore$;
    statuses = CHARGEBACK_STATUSES;
    stages = CHARGEBACK_STAGES;
    categories = CHARGEBACK_CATEGORIES;
    selected: StatChargeback[] = [];

    constructor(
        private fb: NonNullableFormBuilder,
        private qp: QueryParamsService<{
            filters: ChargebacksComponent['filtersForm']['value'];
            dateRange: DateRange;
        }>,
        private fetchChargebacksService: FetchChargebacksService,
        private dialog: DialogService,
        @Inject(DATE_RANGE_DAYS) private dateRangeDays: number,
        private destroyRef: DestroyRef,
    ) {}

    ngOnInit() {
        this.filtersForm.patchValue(
            merge({}, this.qp.params.filters, clean({ dateRange: this.qp.params.dateRange })),
        );
        this.filtersForm.valueChanges
            .pipe(startWith(null), debounceTime(500), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.load();
            });
    }

    more() {
        this.fetchChargebacksService.more();
    }

    load(options?: LoadOptions) {
        const { dateRange, ...filters } = clean(this.filtersForm.value);
        void this.qp.set({ filters, dateRange });
        const { party_id, shop_ids, ...rootParams } = filters;
        const commonParams = clean({ party_id, shop_ids });
        this.fetchChargebacksService.load(
            {
                ...rootParams,
                common_search_query_params: {
                    ...commonParams,
                    from_time: getNoTimeZoneIsoString(dateRange.start),
                    to_time: getNoTimeZoneIsoString(endOfDay(dateRange.end)),
                },
                ...clean(
                    {
                        chargeback_stages: rootParams.chargeback_stages?.map(createUnion),
                        chargeback_categories: rootParams.chargeback_categories?.map(createUnion),
                        chargeback_statuses: rootParams.chargeback_statuses?.map(createUnion),
                    },
                    false,
                    true,
                ),
            },
            options,
        );
        this.active =
            countProps(rootParams, commonParams) +
            +!isEqualDateRange(createDateRangeToToday(this.dateRangeDays), dateRange);
    }

    create() {
        this.dialog
            .open(CreateChargebacksByFileDialogComponent)
            .afterClosed()
            .pipe(
                filter((res) => res.status === DialogResponseStatus.Success),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((res) => {
                this.filtersForm.reset({
                    dateRange: createDateRangeToToday(this.dateRangeDays),
                    chargeback_ids: res.data.map((c) => c.id),
                });
            });
    }

    changeStatuses() {
        this.dialog
            .open(ChangeChargebacksStatusDialogComponent, { chargebacks: this.selected })
            .afterClosed()
            .pipe(
                filter((res) => res.status === DialogResponseStatus.Success),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe(() => {
                this.load();
            });
    }
}
