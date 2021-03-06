import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Shop } from '@vality/domain-proto/lib/domain';
import {
    InvoicePaymentStatus,
    Payer,
    PaymentTool,
    StatPayment,
} from '@vality/domain-proto/lib/merch_stat';

import { getUnionKey } from '@cc/utils/get-union-key';

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
            return payer.customer.email;
        }
        if (payer.payment_resource) {
            return payer.payment_resource.email;
        }
        if (payer.recurrent) {
            return payer.recurrent.email;
        }
        return undefined;
    }

    getPaymentTool(payer: Payer): PaymentTool {
        return (
            payer?.customer?.payment_tool ||
            payer?.payment_resource?.payment_tool ||
            payer?.recurrent?.payment_tool
        );
    }

    hasError(status: InvoicePaymentStatus): boolean {
        return getUnionKey(status) === 'failed';
    }
}
