import { Component, OnInit } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
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

import { ChangeChargebacksStatusDialogComponent } from '../../shared/components/change-chargebacks-status-dialog';

import { CreateChargebacksByFileDialogComponent } from './components/create-chargebacks-by-file-dialog/create-chargebacks-by-file-dialog.component';
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
        dateRange: createDateRangeToToday(),
        party_id: undefined as ChargebackSearchQuery['common_search_query_params']['party_id'],
        shop_ids: [undefined as ChargebackSearchQuery['common_search_query_params']['shop_ids']],
        invoice_ids: [undefined as ChargebackSearchQuery['invoice_ids']],
        chargeback_id: undefined as ChargebackSearchQuery['chargeback_id'],
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
        private dialog: DialogService
    ) {}

    ngOnInit() {
        this.filtersForm.patchValue(
            merge({}, this.qp.params.filters, clean({ dateRange: this.qp.params.dateRange }))
        );
        this.filtersForm.valueChanges
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
                        chargeback_stages: rootParams.chargeback_stages?.map((s) => ({ [s]: {} })),
                        chargeback_categories: rootParams.chargeback_categories?.map((s) => ({
                            [s]: {},
                        })),
                        chargeback_statuses: rootParams.chargeback_statuses?.map((s) => ({
                            [s]: {},
                        })),
                    },
                    false,
                    true
                ),
            },
            options
        );
        this.active =
            countProps(rootParams, commonParams) +
            +!isEqualDateRange(createDateRangeToToday(), dateRange);
    }

    create() {
        this.dialog
            .open(CreateChargebacksByFileDialogComponent)
            .afterClosed()
            .pipe(
                filter((res) => res.status === DialogResponseStatus.Success),
                untilDestroyed(this)
            )
            .subscribe(() => {
                this.load();
            });
    }

    changeStatuses() {
        this.dialog
            .open(ChangeChargebacksStatusDialogComponent, { chargebacks: this.selected })
            .afterClosed()
            .pipe(
                filter((res) => res.status === DialogResponseStatus.Success),
                untilDestroyed(this)
            )
            .subscribe(() => {
                this.load();
            });
    }
}
