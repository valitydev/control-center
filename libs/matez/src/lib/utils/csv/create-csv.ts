import papaparse from 'papaparse';

export function createCsv(data: unknown[]) {
    return papaparse.unparse(data);
}
