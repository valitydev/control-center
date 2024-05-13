import { Component, OnInit, Inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { ChargebackSearchQuery, StatChargeback } from '@vality/magista-proto/magista';
import {
    DateRange,
    clean,
    QueryParamsService,
    LoadOptions,
    getNoTimeZoneIsoString,
    createDateRangeToToday,
    isEqualDateRange,
    DialogService,
    DialogResponseStatus,
    getValueChanges,
    createControls,
    debounceTimeWithFirst,
    countChanged,
} from '@vality/ng-core';
import { createUnion } from '@vality/ng-thrift';
import { endOfDay } from 'date-fns';
import { filter } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Overwrite } from 'utility-types';

import {
    CHARGEBACK_STATUSES,
    CHARGEBACK_STAGES,
    CHARGEBACK_CATEGORIES,
} from '@cc/app/api/fistful-stat';

import { ChangeChargebacksStatusDialogComponent } from '../../shared/components/change-chargebacks-status-dialog';
import { DATE_RANGE_DAYS, DEBOUNCE_TIME_MS } from '../../tokens';

import { CreateChargebacksByFileDialogComponent } from './components/create-chargebacks-by-file-dialog/create-chargebacks-by-file-dialog.component';
import { FetchChargebacksService } from './fetch-chargebacks.service';

type FormValue = {
    dateRange: DateRange;
} & Overwrite<
    Omit<ChargebackSearchQuery, 'common_search_query_params'>,
    Record<'chargeback_stages' | 'chargeback_categories' | 'chargeback_statuses', string[]>
> &
    Pick<ChargebackSearchQuery['common_search_query_params'], 'party_id' | 'shop_ids'>;

@Component({
    selector: 'cc-chargebacks',
    templateUrl: './chargebacks.component.html',
    styles: [],
})
export class ChargebacksComponent implements OnInit {
    filtersForm = new FormGroup(
        createControls<FormValue>({
            dateRange: createDateRangeToToday(this.dateRangeDays),
            party_id: undefined,
            shop_ids: undefined,
            invoice_ids: undefined,
            chargeback_ids: undefined,
            chargeback_statuses: undefined,
            chargeback_stages: undefined,
            chargeback_categories: undefined,
        }),
    );
    chargebacks$ = this.fetchChargebacksService.result$;
    isLoading$ = this.fetchChargebacksService.isLoading$;
    hasMore$ = this.fetchChargebacksService.hasMore$;
    statuses = CHARGEBACK_STATUSES;
    stages = CHARGEBACK_STAGES;
    categories = CHARGEBACK_CATEGORIES;
    selected: StatChargeback[] = [];
    active$ = getValueChanges(this.filtersForm).pipe(
        map((v) => countChanged(this.initFormValue, v, { dateRange: isEqualDateRange })),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    private initFormValue = this.filtersForm.value;

    constructor(
        private qp: QueryParamsService<Partial<FormValue>>,
        private fetchChargebacksService: FetchChargebacksService,
        private dialog: DialogService,
        @Inject(DATE_RANGE_DAYS) private dateRangeDays: number,
        private dr: DestroyRef,
        @Inject(DEBOUNCE_TIME_MS) private debounceTimeMs: number,
    ) {}

    ngOnInit() {
        this.filtersForm.patchValue(this.qp.params, { emitEvent: false });
        getValueChanges(this.filtersForm)
            .pipe(debounceTimeWithFirst(this.debounceTimeMs), takeUntilDestroyed(this.dr))
            .subscribe(() => {
                const value = clean(this.filtersForm.value);
                void this.qp.set(value);
                const { dateRange, party_id, shop_ids, ...rootParams } = value;
                this.load({
                    ...rootParams,
                    common_search_query_params: clean({
                        party_id,
                        shop_ids,
                        from_time: getNoTimeZoneIsoString(dateRange.start),
                        to_time: getNoTimeZoneIsoString(endOfDay(dateRange.end)),
                    }),
                    ...clean(
                        {
                            chargeback_stages: rootParams.chargeback_stages?.map(createUnion),
                            chargeback_categories:
                                rootParams.chargeback_categories?.map(createUnion),
                            chargeback_statuses: rootParams.chargeback_statuses?.map(createUnion),
                        },
                        false,
                        true,
                    ),
                });
            });
    }

    more() {
        this.fetchChargebacksService.more();
    }

    reload(options?: LoadOptions) {
        this.fetchChargebacksService.reload(options);
    }

    load(params: ChargebackSearchQuery, options?: LoadOptions) {
        this.fetchChargebacksService.load(params, options);
    }

    create() {
        this.dialog
            .open(CreateChargebacksByFileDialogComponent)
            .afterClosed()
            .pipe(
                filter((res) => res.status === DialogResponseStatus.Success),
                takeUntilDestroyed(this.dr),
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
                takeUntilDestroyed(this.dr),
            )
            .subscribe(() => {
                this.reload();
            });
    }
}
