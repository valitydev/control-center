import { DeepReadonly } from 'utility-types';

import { CsvObject, CsvProps } from '../../../../../../components/upload-csv';

export const CSV_CHARGEBACK_PROPS = {
    required: [
        'invoice_id',
        'payment_id',

        'reason.category',
        'reason.code',

        'levy.amount',
        'levy.currency.symbolic_code',
    ],
    optional: [
        'body.amount',
        'body.currency.symbolic_code',

        'external_id',
        'occurred_at',

        'context.type',
        'context.data',

        'transaction_info.id',
        'transaction_info.timestamp',
        'transaction_info.extra',
    ],
} as const satisfies DeepReadonly<CsvProps>;

export type CsvChargeback = CsvObject<
    (typeof CSV_CHARGEBACK_PROPS)['required'][number],
    (typeof CSV_CHARGEBACK_PROPS)['optional'][number]
>;
