import { InvoicePaymentStatus, PaymentToolType } from '@vality/magista-proto/magista';

export interface SearchFiltersParams {
    partyID?: string;
    fromTime?: string;
    toTime?: string;
    invoiceIDs?: string;
    shopIDs?: string[];
    payerEmail?: string;
    terminalID?: string;
    providerID?: string;
    rrn?: string;
    paymentMethod?: PaymentToolType;
    paymentSystem?: string;
    tokenProvider?: string;
    bin?: string;
    pan?: string;
    domainRevisionFrom?: number;
    domainRevisionTo?: number;
    paymentAmountFrom?: number;
    paymentAmountTo?: number;
    paymentStatus?: InvoicePaymentStatus;
}
