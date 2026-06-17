import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { PageLayoutModule } from '~/components/page-layout';

import { PaymentDetailsService } from '../../payment.service';
import { RefundsTableModule } from '../../refunds-table';

@Component({
    selector: 'cc-payment-refunds',
    imports: [CommonModule, PageLayoutModule, RefundsTableModule],
    templateUrl: './payment-refunds.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: ``,
})
export class PaymentRefundsComponent {
    private paymentDetailsService = inject(PaymentDetailsService);
    payment$ = this.paymentDetailsService.payment$;
    isLoading$ = this.paymentDetailsService.isLoading$;
}
