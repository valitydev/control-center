import { DataSourceItem } from '../types/data-source-item';

export function filterPredicate({ stringified }: DataSourceItem, filter: string): boolean {
    let regexp;
    try {
        regexp = new RegExp(filter, 'gi');
    } catch {
        return false;
    }
    const matched = stringified.match(regexp);
    return matched && matched.length > 0;
}
