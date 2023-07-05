import Papa, { ParseConfig } from 'papaparse';

export function parseCsv(content: string, config?: ParseConfig) {
    return Papa.parse(content, config);
}
