import { Reference } from '@vality/domain-proto/lib/domain';
import * as uuid from 'uuid/v4';

import { MonacoFile } from '../monaco-editor';

export function parseRef(ref: string): Reference {
    try {
        return JSON.parse(ref) as Reference;
    } catch {
        throw new Error('Malformed domain object ref');
    }
}

export const toMonacoFile = (content: string): MonacoFile => ({
    uri: `${uuid()}.json`,
    language: 'json',
    content,
});
