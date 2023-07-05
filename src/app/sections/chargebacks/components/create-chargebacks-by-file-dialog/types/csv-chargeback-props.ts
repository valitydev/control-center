export const CSV_CHARGEBACK_PROPS = [
    'invoice_id',
    'payment_id',

    'reason.category',
    'reason.code',

    'levy.amount',
    'levy.currency.symbolic_code',

    // Optional
    'body.amount',
    'body.currency.symbolic_code',

    'external_id',
    'occurred_at',

    'context.type',
    'context.data',

    'transaction_info.id',
    'transaction_info.timestamp',
    'transaction_info.extra',
] as const;
