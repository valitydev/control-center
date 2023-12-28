import papa, { ParseConfig } from 'papaparse';

import { removeLineBreaks } from './utils/remove-line-breaks';

export function parseCsv(content: string, config?: ParseConfig) {
    return papa.parse(removeLineBreaks(content), config);
}
