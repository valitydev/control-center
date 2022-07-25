import { InvoicePaymentAdjustmentParams } from '@vality/domain-proto/lib/payment_processing';

export interface PaymentAdjustmentCreationParams {
    invoice_id: string;
    payment_id: string;
    params: InvoicePaymentAdjustmentParams;
}

export interface PaymentAdjustmentCancelParams {
    invoice_id: string;
    payment_id: string;
    adjustment_id: string;
}

export interface PaymentAdjustmentCaptureParams {
    invoice_id: string;
    payment_id: string;
    adjustment_id: string;
}
