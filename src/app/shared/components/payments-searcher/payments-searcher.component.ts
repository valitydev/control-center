import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';

import { SearchFiltersParams } from '../payments-search-filters';
import { PaymentActions, PaymentMenuItemEvent } from '../payments-table';
import { FetchPaymentsService } from './fetch-payments.service';
import { PaymentsSearcherService } from './payments-searcher.service';

@UntilDestroy()
@Component({
    selector: 'cc-payments-searcher',
    templateUrl: 'payments-searcher.component.html',
    providers: [FetchPaymentsService, PaymentsSearcherService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsSearcherComponent implements OnInit {
    @Input() initSearchParams: SearchFiltersParams;
    @Output() searchParamsChanged$: EventEmitter<SearchFiltersParams> = new EventEmitter();
    @Output() paymentEventFired$: EventEmitter<PaymentMenuItemEvent> = new EventEmitter();

    doAction$ = this.fetchPaymentsService.doAction$;
    payments$ = this.fetchPaymentsService.searchResult$;
    hasMore$ = this.fetchPaymentsService.hasMore$;
    params: SearchFiltersParams;

    constructor(
        private fetchPaymentsService: FetchPaymentsService,
        private paymentsSearcherService: PaymentsSearcherService,
        private snackBar: MatSnackBar
    ) {
        this.paymentsSearcherService.searchParamsChanges$
            .pipe(untilDestroyed(this))
            .subscribe((params) => {
                this.params = params;
                // TODO: the partyID is optional, but the backend returns 500
                // if (params.partyID) {
                this.fetchPaymentsService.search(params);
                // }
                this.searchParamsChanged$.emit(params);
            });
    }

    ngOnInit() {
        this.fetchPaymentsService.errors$.subscribe((e) =>
            this.snackBar.open(`An error occurred while search payments (${String(e)})`, 'OK')
        );
    }

    fetchMore() {
        this.fetchPaymentsService.fetchMore();
    }

    searchParamsChanges(params: SearchFiltersParams) {
        this.paymentsSearcherService.searchParamsChanges(params);
    }

    paymentMenuItemSelected(paymentMenuItemEvent: PaymentMenuItemEvent) {
        switch (paymentMenuItemEvent.action) {
            case PaymentActions.NavigateToPayment:
                this.paymentEventFired$.emit(paymentMenuItemEvent);
                break;
        }
    }
}
