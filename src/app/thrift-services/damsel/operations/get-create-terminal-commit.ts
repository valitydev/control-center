import { TerminalObject } from '@vality/domain-proto/lib/domain';
import { Commit } from '@vality/domain-proto/lib/domain_config';

import { createTerminalObject } from './create-terminal-object';
import { CreateTerminalParams } from './create-terminal-params';

export interface GetCreateTerminalCommit {
    commit: Commit;
    id: number;
}

export const getCreateTerminalCommit = (
    terminalObjects: TerminalObject[],
    params: CreateTerminalParams
): GetCreateTerminalCommit => {
    const { terminal, id } = createTerminalObject(terminalObjects, params);
    return {
        commit: {
            ops: [
                {
                    insert: {
                        object: { terminal },
                    },
                },
            ],
        },
        id,
    };
};
