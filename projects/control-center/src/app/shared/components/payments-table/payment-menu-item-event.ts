import { InvoiceID, InvoicePaymentID, PartyID } from '@vality/domain-proto/lib/domain';

import { PaymentActions } from './payment-actions';

export interface PaymentMenuItemEvent {
    action: PaymentActions;
    paymentID: InvoicePaymentID;
    invoiceID: InvoiceID;
    partyID: PartyID;
}
