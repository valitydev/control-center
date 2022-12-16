import { InvoiceID, InvoicePaymentID, PartyID } from '@vality/domain-proto/domain';

import { PaymentActions } from './payment-actions';

export interface PaymentMenuItemEvent {
    action: PaymentActions;
    paymentID: InvoicePaymentID;
    invoiceID: InvoiceID;
    partyID: PartyID;
}
