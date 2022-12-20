import { InvoicePaymentFlow, InvoicePaymentStatus, PaymentTool } from '@vality/domain-proto/domain';

export interface Payment {
    payment_id?: string;
    invoice_id?: string;
    payment_email?: string;
    payment_flow?: InvoicePaymentFlow;
    payment_method?: PaymentTool;
    payment_ip?: string;
    payment_provider_id?: string;
    payment_terminal_id?: string;
    payment_fingerprint?: string;
    payment_pan_mask?: string;
    payment_customer_id?: string;
    payment_amount?: string;
    payment_status?: InvoicePaymentStatus;
    payment_domain_revision?: string;
}
