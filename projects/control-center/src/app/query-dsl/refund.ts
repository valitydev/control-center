import * as base from '@vality/domain-proto/lib/base';
import {
    Amount,
    InvoiceID,
    InvoicePaymentID,
    InvoicePaymentRefundID,
    PartyID,
    ShopID,
} from '@vality/domain-proto/lib/domain';
import { InvoicePaymentRefundStatus } from '@vality/domain-proto/lib/merch_stat';

export interface Refund {
    id: InvoicePaymentRefundID;
    payment_id: InvoicePaymentID;
    invoice_id: InvoiceID;
    owner_id: PartyID;
    shop_id: ShopID;
    status: InvoicePaymentRefundStatus;
    created_at: base.Timestamp;
    amount: Amount;
    fee: Amount;
    currency_symbolic_code: string;
    external_id?: string;
}
