import { Component, OnInit, Inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder } from '@angular/forms';
import { ThriftAstMetadata } from '@vality/fistful-proto';
import { StatPayment } from '@vality/magista-proto/magista';
import {
    DialogService,
    DialogResponseStatus,
    LoadOptions,
    getNoTimeZoneIsoString,
    clean,
    DateRange,
    QueryParamsService,
    createDateRangeToToday,
    countProps,
    isEqualDateRange,
} from '@vality/ng-core';
import { endOfDay } from 'date-fns';
import { uniq } from 'lodash-es';
import isEqual from 'lodash-es/isEqual';
import lodashMerge from 'lodash-es/merge';
import omit from 'lodash-es/omit';
import { BehaviorSubject, debounceTime, from, of, merge } from 'rxjs';
import { startWith, map, distinctUntilChanged } from 'rxjs/operators';

import { FailMachinesDialogComponent, Type } from '../../shared/components/fail-machines-dialog';
import { MetadataFormExtension, isTypeWithAliases } from '../../shared/components/metadata-form';
import { DATE_RANGE_DAYS } from '../../tokens';

import { CreatePaymentAdjustmentComponent } from './components/create-payment-adjustment/create-payment-adjustment.component';
import { FetchPaymentsService } from './services/fetch-payments.service';

interface Filters {
    filters: PaymentsComponent['filtersForm']['value'];
    otherFilters: PaymentsComponent['otherFiltersControl']['value'];
    dateRange: DateRange;
}

@Component({
    templateUrl: 'payments.component.html',
})
export class PaymentsComponent implements OnInit {
    isLoading$ = this.fetchPaymentsService.isLoading$;
    payments$ = this.fetchPaymentsService.result$;
    hasMore$ = this.fetchPaymentsService.hasMore$;
    selected$ = new BehaviorSubject<StatPayment[]>([]);
    filtersForm = this.fb.group({
        dateRange: createDateRangeToToday(this.dateRangeDays),
        invoice_ids: [undefined as string[]],
        party_id: undefined as string,
        shop_ids: [undefined as string[]],
        payment_first6: undefined as string,
        payment_last4: undefined as string,
        payment_rrn: undefined as string,
        payment_email: undefined as string,
        error_message: undefined as string,
        external_id: undefined as string,
    });
    otherFiltersControl = this.fb.control({
        common_search_query_params: {},
        payment_params: {},
    });
    metadata$ = from(
        import('@vality/magista-proto/metadata.json').then((m) => m.default as ThriftAstMetadata[]),
    );
    extensions: MetadataFormExtension[] = [
        {
            determinant: (data) =>
                of(
                    isTypeWithAliases(data, 'CommonSearchQueryParams', 'magista') ||
                        [
                            'invoice_ids',
                            'payment_email',
                            'payment_first6',
                            'payment_last4',
                            'payment_rrn',
                            'error_message',
                            'external_id',
                        ].includes(data?.field?.name),
                ),
            extension: () => of({ hidden: true }),
        },
    ];
    active = 0;

    constructor(
        private qp: QueryParamsService<Filters>,
        private fetchPaymentsService: FetchPaymentsService,
        private dialogService: DialogService,
        private fb: NonNullableFormBuilder,
        @Inject(DATE_RANGE_DAYS) private dateRangeDays: number,
        private destroyRef: DestroyRef,
    ) {}

    ngOnInit() {
        this.filtersForm.patchValue(
            lodashMerge({}, this.qp.params.filters, clean({ dateRange: this.qp.params.dateRange })),
        );
        this.otherFiltersControl.patchValue(
            lodashMerge({}, this.otherFiltersControl.value, this.qp.params.otherFilters || {}),
        );
        merge(this.filtersForm.valueChanges, this.otherFiltersControl.valueChanges)
            .pipe(
                startWith(null),
                debounceTime(500),
                map(() => {
                    const { dateRange, ...filters } = clean(this.filtersForm.value);
                    const otherFilters = clean(this.otherFiltersControl.value);
                    return { filters, dateRange, otherFilters };
                }),
                distinctUntilChanged(isEqual),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((filters) => {
                this.load(filters);
            });
    }

    more() {
        this.fetchPaymentsService.more();
    }

    load({ filters, otherFilters, dateRange }: Filters, options?: LoadOptions) {
        void this.qp.set({ filters, otherFilters, dateRange });
        const { invoice_ids, party_id, shop_ids, external_id, ...paymentParams } = filters;
        const searchParams = clean({
            ...otherFilters,
            common_search_query_params: {
                ...(otherFilters.common_search_query_params || {}),
                party_id,
                shop_ids,
                from_time: getNoTimeZoneIsoString(dateRange.start),
                to_time: getNoTimeZoneIsoString(endOfDay(dateRange.end)),
            },
            payment_params: { ...(otherFilters.payment_params || {}), ...paymentParams },
            external_id,
            invoice_ids,
        });
        this.fetchPaymentsService.load(searchParams, options);
        this.active =
            countProps(
                omit(searchParams, 'payment_params', 'common_search_query_params'),
                searchParams.payment_params,
                omit(searchParams.common_search_query_params, 'from_time', 'to_time'),
            ) + +!isEqualDateRange(dateRange, createDateRangeToToday(this.dateRangeDays));
    }

    update(options?: LoadOptions) {
        this.fetchPaymentsService.reload(options);
    }

    createPaymentAdjustment() {
        this.dialogService
            .open(CreatePaymentAdjustmentComponent, {
                payments: this.selected$.value,
            })
            .afterClosed()
            .subscribe((res) => {
                if (res.status === DialogResponseStatus.Success) {
                    this.update();
                    this.selected$.next([]);
                } else if (res.data?.errors?.length) {
                    this.selected$.next(res.data.errors.map(({ data }) => data));
                }
            });
    }

    failMachines() {
        this.dialogService
            .open(FailMachinesDialogComponent, {
                ids: uniq(this.selected$.value.map((s) => s.invoice_id)),
                type: Type.Invoice,
            })
            .afterClosed()
            .subscribe((res) => {
                if (res.status === DialogResponseStatus.Success) {
                    this.update();
                    this.selected$.next([]);
                } else if (res.data?.errors?.length) {
                    this.selected$.next(
                        res.data.errors.map(({ index }) => this.selected$.value[index]),
                    );
                }
            });
    }
}
