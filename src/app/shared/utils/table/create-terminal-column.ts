import { Column, PossiblyAsync, getPossiblyAsyncObservable } from '@vality/ng-core';
import { map } from 'rxjs/operators';

import { createDomainObjectColumn } from './create-domain-object-column';

export function createTerminalColumn<T extends object>(
    selectTerminalId: (d: T) => PossiblyAsync<number>,
): Column<T> {
    return createDomainObjectColumn('terminal', (d) =>
        getPossiblyAsyncObservable(selectTerminalId(d)).pipe(map((id) => ({ id }))),
    );
}
