import { DeepReadonly } from 'utility-types';

import { CsvObject, CsvProps } from '../../../../../../components/upload-csv';

export const CSV_PAYMENT_ADJUSTMENT_PROPS = {
    required: ['invoice_id', 'payment_id', 'reason'],
    optional: [
        'scenario.cash_flow.domain_revision',
        'scenario.cash_flow.new_amount',
        'scenario.status_change.target_status',
        'scenario.status_change.target_status.data',
    ],
} as const satisfies DeepReadonly<CsvProps>;

export type CsvPaymentAdjustment = CsvObject<
    (typeof CSV_PAYMENT_ADJUSTMENT_PROPS)['required'][number],
    (typeof CSV_PAYMENT_ADJUSTMENT_PROPS)['optional'][number]
>;
