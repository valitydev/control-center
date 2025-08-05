import { QueryDsl } from '../types';

export function createDsl(query: QueryDsl['query']): string {
    return JSON.stringify({ query });
}
