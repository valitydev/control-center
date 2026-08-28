import { InvoiceEventType } from '@vality/domain-proto/webhooker';

export const SHOP_INVOICE_EVENT_TYPES: InvoiceEventType = {
    created: {},
    status_changed: {
        value: {
            unpaid: {},
            paid: {},
            cancelled: {},
            fulfilled: {},
        },
    },
    payment: {
        created: {},
        status_changed: {
            value: {
                pending: {},
                processed: {},
                captured: {},
                cancelled: {},
                failed: {},
                refunded: {},
            },
        },
        invoice_payment_refund_change: {
            invoice_payment_refund_created: {},
            invoice_payment_refund_status_changed: {
                value: {
                    pending: {},
                    succeeded: {},
                    failed: {},
                },
            },
        },
        user_interaction: {
            status: {
                requested: {},
                completed: {},
            },
        },
    },
};
