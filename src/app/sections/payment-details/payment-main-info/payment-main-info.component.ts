import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Shop } from '@vality/domain-proto/domain';
import { Payer, StatPayment } from '@vality/magista-proto';
import { InvoicePaymentStatus, PaymentTool } from '@vality/magista-proto/lib/domain';

import { getUnionKey } from '../../../../utils';

@Component({
    selector: 'cc-payment-main-info',
    templateUrl: 'payment-main-info.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentMainInfoComponent {
    @Input() payment: StatPayment;
    @Input() shop: Shop;

    getPayerEmail(payer: Payer): string {
        if (payer.customer) {
            return payer.customer.contact_info.email;
        }
        if (payer.payment_resource) {
            return payer.payment_resource.contact_info.email;
        }
        if (payer.recurrent) {
            return payer.recurrent.contact_info.email;
        }
        return undefined;
    }

    getPaymentTool(payer: Payer): PaymentTool {
        return (
            payer?.customer?.payment_tool ||
            payer?.payment_resource?.resource?.payment_tool ||
            payer?.recurrent?.payment_tool
        );
    }

    hasError(status: InvoicePaymentStatus): boolean {
        return getUnionKey(status) === 'failed';
    }
}
