import { ProviderObject } from '@vality/domain-proto/lib/domain';
import { Commit } from '@vality/domain-proto/lib/domain_config';

import { createRemoveTerminalFromProviderOperation } from './create-remove-terminal-from-provider-operation';
import { RemoveTerminalFromShopParams } from './remove-terminal-from-shop-params';

export const createRemoveTerminalFromShopCommit = (
    providerObject: ProviderObject,
    params: RemoveTerminalFromShopParams
): Commit => ({
    ops: [
        {
            update: createRemoveTerminalFromProviderOperation(providerObject, params),
        },
    ],
});
