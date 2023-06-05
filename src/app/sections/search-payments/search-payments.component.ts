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
    DateRange,
    getNoTimeZoneIsoString,
    createDateFromNoTimeZoneString,
    clean,
} from '@vality/ng-core';
import { endOfDay, startOfDay, subDays } from 'date-fns';
import isEqual from 'lodash-es/isEqual';
import { BehaviorSubject, debounceTime, distinctUntilChanged, from, of } from 'rxjs';
import { startWith } from 'rxjs/operators';

import { MetadataFormExtension, isTypeWithAliases } from '../../shared/components/metadata-form';
import { QueryParamsService } from '../../shared/services';
import { CreatePaymentAdjustmentComponent } from './components/create-payment-adjustment/create-payment-adjustment.component';
import { FetchPaymentsService } from './services/fetch-payments.service';

@UntilDestroy()
@Component({
    templateUrl: 'search-payments.component.html',
})
export class SearchPaymentsComponent implements OnInit {
    isLoading$ = this.fetchPaymentsService.isLoading$;
    payments$ = this.fetchPaymentsService.result$;
    hasMore$ = this.fetchPaymentsService.hasMore$;
    selected$ = new BehaviorSubject<StatPayment[]>([]);
    filtersForm = this.fb.group({
        dateRange: undefined as DateRange,
        invoice_ids: [undefined as string[]],
        party_id: undefined as string,
        shop_ids: [undefined as string[]],
        payment_first6: undefined as string,
        payment_last4: undefined as string,
        payment_rrn: undefined as string,
        payment_email: undefined as string,
    });
    allFiltersControl = this.fb.control<PaymentSearchQuery>({
        common_search_query_params: {
            from_time: getNoTimeZoneIsoString(subDays(startOfDay(new Date()), 1)),
            to_time: getNoTimeZoneIsoString(endOfDay(new Date())),
        },
        payment_params: {},
    });
    metadata$ = from(
        import('@vality/magista-proto/metadata.json').then((m) => m.default as ThriftAstMetadata[])
    );
    extensions: MetadataFormExtension[] = [
        {
            determinant: (data) =>
                of(
                    isTypeWithAliases(data, 'ContinuationToken', 'magista') ||
                        data?.field?.name === 'limit'
                ),
            extension: () => of({ hidden: true }),
        },
    ];
    active = 0;

    constructor(
        private router: Router,
        private qp: QueryParamsService<PaymentSearchQuery>,
        private fetchPaymentsService: FetchPaymentsService,
        private dialogService: DialogService,
        private fb: NonNullableFormBuilder
    ) {}

    ngOnInit() {
        this.allFiltersControl.patchValue({
            ...this.allFiltersControl.value,
            ...this.qp.params,
            common_search_query_params:
                this.qp.params.common_search_query_params ||
                this.allFiltersControl.value.common_search_query_params,
            payment_params:
                this.qp.params.payment_params || this.allFiltersControl.value.payment_params || {},
        });
        this.filtersForm.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
            const { dateRange, ...filters } = value;
            const oldValue = this.allFiltersControl.value;
            this.allFiltersControl.patchValue({
                ...oldValue,
                common_search_query_params: clean({
                    ...oldValue.common_search_query_params,
                    from_time: getNoTimeZoneIsoString(dateRange.start),
                    to_time: getNoTimeZoneIsoString(endOfDay(dateRange.end)),
                    party_id: filters.party_id,
                    shop_ids: filters.shop_ids,
                }),
                payment_params: clean({
                    ...oldValue.payment_params,
                    payment_rrn: filters.payment_rrn,
                    payment_email: filters.payment_email,
                    payment_first6: filters.payment_first6,
                    payment_last4: filters.payment_last4,
                }),
                ...clean({ invoice_ids: filters.invoice_ids }),
            });
        });
        this.allFiltersControl.valueChanges
            .pipe(
                startWith(this.allFiltersControl.value),
                debounceTime(500),
                distinctUntilChanged(isEqual),
                untilDestroyed(this)
            )
            .subscribe((filters) => {
                this.filtersForm.patchValue({
                    dateRange: {
                        start: createDateFromNoTimeZoneString(
                            filters.common_search_query_params.from_time
                        ),
                        end: createDateFromNoTimeZoneString(
                            filters.common_search_query_params.to_time
                        ),
                    },
                    invoice_ids: filters.invoice_ids,
                    party_id: filters.common_search_query_params.party_id,
                    shop_ids: filters.common_search_query_params.shop_ids,
                    payment_first6: filters.payment_params.payment_first6,
                    payment_last4: filters.payment_params.payment_last4,
                    payment_rrn: filters.payment_params.payment_rrn,
                    payment_email: filters.payment_params.payment_email,
                });
                this.load();
            });
    }

    more() {
        this.fetchPaymentsService.more();
    }

    load(options?: LoadOptions) {
        const filters = this.allFiltersControl.value;
        void this.qp.set(filters);
        this.fetchPaymentsService.load(filters, options);
        this.active =
            Object.keys(filters.payment_params).length +
            Object.keys(filters.common_search_query_params).length +
            Object.keys(filters).length -
            2;
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
