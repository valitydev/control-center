import { Component, OnInit } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { ThriftAstMetadata } from '@vality/fistful-proto';
import { PaymentSearchQuery, StatPayment } from '@vality/magista-proto/magista';
import {
    DialogService,
    DialogResponseStatus,
    LoadOptions,
    getNoTimeZoneIsoString,
    clean,
    DateRange,
} from '@vality/ng-core';
import { endOfDay, startOfDay, subDays } from 'date-fns';
import lodashMerge from 'lodash-es/merge';
import { BehaviorSubject, debounceTime, from, of, merge } from 'rxjs';
import { startWith } from 'rxjs/operators';

import { MetadataFormExtension, isTypeWithAliases } from '../../shared/components/metadata-form';
import { QueryParamsService } from '../../shared/services';
import { CreatePaymentAdjustmentComponent } from './components/create-payment-adjustment/create-payment-adjustment.component';
import { FetchPaymentsService } from './services/fetch-payments.service';

@UntilDestroy()
@Component({
    templateUrl: 'payments.component.html',
})
export class PaymentsComponent implements OnInit {
    isLoading$ = this.fetchPaymentsService.isLoading$;
    payments$ = this.fetchPaymentsService.result$;
    hasMore$ = this.fetchPaymentsService.hasMore$;
    selected$ = new BehaviorSubject<StatPayment[]>([]);
    filtersForm = this.fb.group({
        dateRange: {
            start: subDays(startOfDay(new Date()), 1),
            end: endOfDay(new Date()),
        } as DateRange,
        invoice_ids: [undefined as string[]],
        party_id: undefined as string,
        shop_ids: [undefined as string[]],
        payment_first6: undefined as string,
        payment_last4: undefined as string,
        payment_rrn: undefined as string,
        payment_email: undefined as string,
    });
    otherFiltersControl = this.fb.control({
        common_search_query_params: {},
        payment_params: {},
    });
    metadata$ = from(
        import('@vality/magista-proto/metadata.json').then((m) => m.default as ThriftAstMetadata[])
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
                        ].includes(data?.field?.name)
                ),
            extension: () => of({ hidden: true }),
        },
    ];
    active = 0;

    constructor(
        private router: Router,
        private qp: QueryParamsService<{
            filters: object;
            otherFilters: object;
            dateRange: DateRange;
        }>,
        private fetchPaymentsService: FetchPaymentsService,
        private dialogService: DialogService,
        private fb: NonNullableFormBuilder
    ) {}

    ngOnInit() {
        this.filtersForm.patchValue(
            lodashMerge({}, this.qp.params.filters, clean({ dateRange: this.qp.params.dateRange }))
        );
        const otherFilters = this.otherFiltersControl.value;
        const otherFiltersParams: Partial<PaymentSearchQuery> = this.qp.params.otherFilters || {};
        this.otherFiltersControl.patchValue(lodashMerge({}, otherFilters, otherFiltersParams));
        merge(this.filtersForm.valueChanges, this.otherFiltersControl.valueChanges)
            .pipe(startWith(null), debounceTime(500), untilDestroyed(this))
            .subscribe(() => {
                this.load();
            });
    }

    more() {
        this.fetchPaymentsService.more();
    }

    load(options?: LoadOptions) {
        const { dateRange, ...filters } = clean(this.filtersForm.value);
        const otherFilters = clean(this.otherFiltersControl.value);
        void this.qp.set({ filters, otherFilters, dateRange });
        this.fetchPaymentsService.load(
            clean({
                ...otherFilters,
                common_search_query_params: {
                    ...(otherFilters.common_search_query_params || {}),
                    party_id: filters.party_id,
                    shop_ids: filters.shop_ids,
                    from_time: getNoTimeZoneIsoString(dateRange.start),
                    to_time: getNoTimeZoneIsoString(dateRange.end),
                },
                payment_params: {
                    ...(otherFilters.payment_params || {}),
                    payment_email: filters.payment_email,
                    payment_first6: filters.payment_first6,
                    payment_last4: filters.payment_last4,
                    payment_rrn: filters.payment_rrn,
                },
                invoice_ids: filters.invoice_ids,
            }),
            options
        );
        this.active =
            Object.keys(dateRange).length +
            Object.keys(filters).length +
            Object.keys(otherFilters.payment_params || {}).length +
            Object.keys(otherFilters.common_search_query_params || {}).length;
    }

    createPaymentAdjustment() {
        this.dialogService
            .open(CreatePaymentAdjustmentComponent, {
                payments: this.selected$.value,
            })
            .afterClosed()
            .subscribe((res) => {
                if (res.status === DialogResponseStatus.Success) {
                    this.load();
                    this.selected$.next([]);
                } else if (res.data?.withError?.length) {
                    this.selected$.next(res.data.withError.map((w) => w.payment));
                }
            });
    }
}