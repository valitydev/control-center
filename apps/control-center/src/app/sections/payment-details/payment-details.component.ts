import { ChangeDetectionStrategy, Component } from '@angular/core';
import { InvoicePaymentFlow, InvoicePaymentStatus } from '@vality/domain-proto/internal/domain';
import { Color } from '@vality/matez';
import { getUnionKey } from '@vality/ng-thrift';
import startCase from 'lodash-es/startCase';
import { map } from 'rxjs/operators';

import { PaymentDetailsService } from './payment-details.service';

@Component({
    templateUrl: 'payment-details.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [PaymentDetailsService],
    standalone: false,
})
export class PaymentDetailsComponent {
    payment$ = this.paymentDetailsService.payment$;
    isLoading$ = this.paymentDetailsService.isLoading$;
    tags$ = this.payment$.pipe(
        map((payment) => [
            {
                value: payment.currency_symbolic_code,
            },
            {
                value: startCase(getUnionKey(payment.status)),
                color: (
                    {
                        captured: 'success',
                        refunded: 'success',
                        charged_back: 'success',
                        pending: 'pending',
                        processed: 'pending',
                        cancelled: 'warn',
                        failed: 'warn',
                    } as Record<keyof InvoicePaymentStatus, Color>
                )[getUnionKey(payment.status)],
            },
            ...(getUnionKey(payment.flow) === 'hold'
                ? [
                      {
                          value: startCase(getUnionKey(payment.flow)),
                          color: (
                              {
                                  instant: 'success',
                                  hold: 'pending',
                              } as Record<keyof InvoicePaymentFlow, Color>
                          )[getUnionKey(payment.flow)],
                      },
                  ]
                : []),
            ...(payment.make_recurrent
                ? [
                      {
                          value: payment.make_recurrent ? 'Recurrent' : 'Not Recurrent',
                          color: payment.make_recurrent ? 'pending' : 'neutral',
                      },
                  ]
                : []),
        ]),
    );

    constructor(private paymentDetailsService: PaymentDetailsService) {}
}
