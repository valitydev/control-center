import * as short from 'short-uuid';

import { MonacoFile } from '@cc/components/monaco-editor';

export const toMonacoFile = (content: string): MonacoFile => ({
    uri: `${short().uuid()}.json`,
    language: 'json',
    content,
});
