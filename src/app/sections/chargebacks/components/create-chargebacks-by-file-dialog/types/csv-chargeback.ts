import { CsvItem } from '@cc/utils';

import { CSV_CHARGEBACK_PROPS } from './csv-chargeback-props';

export type CsvChargeback = CsvItem<(typeof CSV_CHARGEBACK_PROPS)[number]>;
