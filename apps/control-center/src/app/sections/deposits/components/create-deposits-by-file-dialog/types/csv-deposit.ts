import { DeepReadonly } from 'utility-types';

import { CsvProps, CsvObject } from '../../../../../../components/upload-csv';

export const CSV_DEPOSIT_PROPS = {
    required: ['wallet_id', 'source_id', 'body.amount', 'body.currency'],
    optional: ['external_id', 'description', 'metadata'],
} as const satisfies DeepReadonly<CsvProps>;

export type CsvDeposit = CsvObject<
    (typeof CSV_DEPOSIT_PROPS)['required'][number],
    (typeof CSV_DEPOSIT_PROPS)['optional'][number]
>;
