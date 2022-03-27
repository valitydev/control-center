import {
    InvoiceID,
    InvoicePaymentID,
    InvoicePaymentRefundID,
    InvoicePaymentRefundStatus,
    ShopID,
} from '@vality/domain-proto/lib/domain';

export interface RefundsSearchParams {
    invoiceID?: InvoiceID;
    id?: InvoicePaymentRefundID;
    paymentID?: InvoicePaymentID;
    ownerID?: string;
    shopID?: ShopID;
    status?: InvoicePaymentRefundStatus;
    createdAt?: string;
    amount?;
    fee?;
    externalID?;
    currencySymbolicCode?;
}
