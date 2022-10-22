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
import { BehaviorSubject, skip } from 'rxjs';

import { SearchFiltersParams } from '../payments-search-filters';
import { PaymentActions, PaymentMenuItemEvent } from '../payments-table';
import { FetchPaymentsService } from './fetch-payments.service';

@UntilDestroy()
@Component({
    selector: 'cc-payments-searcher',
    templateUrl: 'payments-searcher.component.html',
    providers: [FetchPaymentsService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsSearcherComponent implements OnInit {
    @Input() initSearchParams: SearchFiltersParams;
    @Output() searchParamsChanged: EventEmitter<SearchFiltersParams> = new EventEmitter();
    @Output() paymentEventFired: EventEmitter<PaymentMenuItemEvent> = new EventEmitter();

    doAction$ = this.fetchPaymentsService.doAction$;
    payments$ = this.fetchPaymentsService.searchResult$;
    hasMore$ = this.fetchPaymentsService.hasMore$;
    params: SearchFiltersParams;
    searchParamsChange$ = new BehaviorSubject<SearchFiltersParams>({});

    constructor(
        private fetchPaymentsService: FetchPaymentsService,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit() {
        this.searchParamsChange$.pipe(skip(1), untilDestroyed(this)).subscribe((params) => {
            this.params = params;
            this.fetchPaymentsService.search(params);
            this.searchParamsChanged.emit(params);
        });
        this.fetchPaymentsService.errors$.subscribe((e) =>
            this.snackBar.open(`An error occurred while search payments (${String(e)})`, 'OK')
        );
    }

    fetchMore() {
        this.fetchPaymentsService.fetchMore();
    }

    searchParamsChanges(params: SearchFiltersParams) {
        this.searchParamsChange$.next({ ...this.searchParamsChange$.value, ...params });
    }

    paymentMenuItemSelected(paymentMenuItemEvent: PaymentMenuItemEvent) {
        switch (paymentMenuItemEvent.action) {
            case PaymentActions.NavigateToPayment:
                this.paymentEventFired.emit(paymentMenuItemEvent);
                break;
        }
    }
}
