import {
    InvoiceID,
    InvoicePaymentID,
    InvoicePaymentRefundID,
    InvoicePaymentRefundStatus,
    ShopID,
} from '../../../thrift-services/damsel/gen-model/domain';

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
