import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { pluck, shareReplay, switchMap, map } from 'rxjs/operators';

import { InvoicingService } from '../../api/payment-processing/invoicing.service';
import { PaymentDetailsService } from './payment-details.service';

@Component({
    templateUrl: 'payment-details.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [PaymentDetailsService],
})
export class PaymentDetailsComponent {
    partyID$ = this.route.params.pipe(pluck('partyID'));
    payment$ = this.paymentDetailsService.payment$;
    isLoading$ = this.paymentDetailsService.isLoading$;
    shop$ = this.paymentDetailsService.shop$;

    chargebacks$ = this.route.params.pipe(
        switchMap(({ invoiceID, paymentID }: Record<'invoiceID' | 'paymentID', string>) =>
            this.invoicingService.GetPayment(invoiceID, paymentID)
        ),
        map(({ chargebacks }) => chargebacks),
        shareReplay({ refCount: true, bufferSize: 1 })
    );

    constructor(
        private paymentDetailsService: PaymentDetailsService,
        private route: ActivatedRoute,
        private invoicingService: InvoicingService
    ) {}
}
