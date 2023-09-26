import Papa, { ParseConfig } from 'papaparse';

import { removeLineBreaks } from './utils/remove-line-breaks';

export function parseCsv(content: string, config?: ParseConfig) {
    return Papa.parse(removeLineBreaks(content), config);
}
