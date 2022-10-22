import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { clean } from '@vality/ng-core';

import {
    PaymentActions,
    PaymentMenuItemEvent,
    SearchFiltersParams,
} from '@cc/app/shared/components';

import { QueryParamsService } from '../../shared/services';

@Component({
    templateUrl: 'search-payments.component.html',
})
export class SearchPaymentsComponent {
    constructor(private router: Router, public qp: QueryParamsService<SearchFiltersParams>) {}

    searchParamsUpdated(params: SearchFiltersParams) {
        void this.qp.set(clean(params));
    }

    paymentEventFired($event: PaymentMenuItemEvent) {
        const { partyID, invoiceID, paymentID } = $event;
        switch ($event.action) {
            case PaymentActions.NavigateToPayment:
                void this.router.navigate([
                    `/party/${partyID}/invoice/${invoiceID}/payment/${paymentID}`,
                ]);
        }
    }
}
