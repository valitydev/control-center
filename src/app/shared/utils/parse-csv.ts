import Papa, { ParseConfig } from 'papaparse';

export function parseCsv(content: string, config: ParseConfig = { delimiter: ';' }) {
    return Papa.parse(content, config);
}
