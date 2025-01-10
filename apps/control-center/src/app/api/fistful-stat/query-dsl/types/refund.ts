import {
    Amount,
    InvoiceID,
    InvoicePaymentID,
    InvoicePaymentRefundID,
    InvoicePaymentRefundStatus,
    PartyID,
    ShopID,
} from '@vality/domain-proto/domain';

export interface Refund {
    id: InvoicePaymentRefundID;
    payment_id: InvoicePaymentID;
    invoice_id: InvoiceID;
    owner_id: PartyID;
    shop_id: ShopID;
    status: InvoicePaymentRefundStatus;
    created_at: string;
    amount: Amount;
    fee: Amount;
    currency_symbolic_code: string;
    external_id?: string;
}
