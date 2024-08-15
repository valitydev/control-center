import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { PageLayoutModule } from '../../../../shared';
import { PaymentDetailsService } from '../../payment-details.service';
import { RefundsTableModule } from '../../refunds-table';

@Component({
    selector: 'cc-payment-refunds',
    standalone: true,
    imports: [CommonModule, PageLayoutModule, RefundsTableModule],
    templateUrl: './payment-refunds.component.html',
    styles: ``,
})
export class PaymentRefundsComponent {
    payment$ = this.paymentDetailsService.payment$;
    isLoading$ = this.paymentDetailsService.isLoading$;

    constructor(private paymentDetailsService: PaymentDetailsService) {}
}
