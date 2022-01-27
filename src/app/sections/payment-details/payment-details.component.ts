import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { pluck, shareReplay } from 'rxjs/operators';

import { PaymentDetailsService } from './payment-details.service';

@Component({
    templateUrl: 'payment-details.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [PaymentDetailsService],
})
export class PaymentDetailsComponent {
    partyID$ = this.route.params.pipe(pluck('partyID'), shareReplay(1));
    payment$ = this.paymentDetailsService.payment$;
    isLoading$ = this.paymentDetailsService.isLoading$;
    shop$ = this.paymentDetailsService.shop$;
    updateSearchParams$ = new Subject();

    constructor(
        private paymentDetailsService: PaymentDetailsService,
        private route: ActivatedRoute
    ) {}
}
