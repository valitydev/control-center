import * as uuid from 'uuid/v4';

import { MonacoFile } from '../../monaco-editor';

export const toMonacoFile = (content: string): MonacoFile => ({
    uri: `${uuid()}.json`,
    language: 'json',
    content,
});
