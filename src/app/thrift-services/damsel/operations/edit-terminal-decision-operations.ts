import { ProviderObject } from '@vality/domain-proto/lib/domain';
import { UpdateOp } from '@vality/domain-proto/lib/domain_config';

import { editTerminalDecisionPropertyForShop } from './edit-terminal-decision-property-for-shop';
import { EditTerminalDecisionPropertyParams } from './edit-terminal-decision-property-params';

export const editTerminalDecisionPropertyForShopOperation = (
    providerObject: ProviderObject,
    params: EditTerminalDecisionPropertyParams
): UpdateOp => ({
    old_object: { provider: providerObject },
    new_object: {
        provider: editTerminalDecisionPropertyForShop(providerObject, params),
    },
});
