import { Failure } from '@vality/domain-proto/domain';
import { createColumn } from '@vality/matez';

function getFailureMessageTree(failure: Failure, withReason = true, level = Infinity) {
    if (!failure) {
        return '';
    }
    return (
        (failure.code || '') +
        (withReason && failure.reason ? ` (${failure.reason})` : '') +
        (level > 1 && failure?.sub
            ? ` > ${getFailureMessageTree(failure.sub, withReason, level - 1)}`
            : '')
    );
}

export const createFailureColumn = createColumn(
    ({ failure, noFailureMessage }: { failure: Failure; noFailureMessage?: string }) => ({
        value: noFailureMessage || getFailureMessageTree(failure, false, 2),
        description: failure?.reason || '',
        tooltip: failure?.sub?.sub ? JSON.stringify(failure.sub.sub, null, 2) : '',
    }),
    { header: 'Failure' },
);
