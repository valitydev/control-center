import { InvoicePaymentStatus } from '@vality/magista-proto';

export interface SearchFormParams {
    fromTime: string;
    toTime: string;
    partyId: string;
    fromRevision: number;
    toRevision: number;
    providerID: string;
    terminalID: string;
    status: InvoicePaymentStatus;
    shopId: string;
    invoiceIds: string[];
}
