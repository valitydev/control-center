import { Modification } from '@vality/domain-proto/lib/claim_management';

import { getOr } from '@cc/utils/get-or';
import { getUnionValue } from '@cc/utils/get-union-key';

import { PartyTarget } from '../party-target';
import { SelectableItem } from './selectable-item';

export const modificationsToSelectableItems = (
    mods: Modification[],
    target: PartyTarget
): SelectableItem[] =>
    mods
        .filter((mod) => {
            switch (target) {
                case PartyTarget.Contract:
                    return !!getOr(
                        mod,
                        'party_modification.contract_modification.modification.creation',
                        false
                    );
                case PartyTarget.Contractor:
                    return !!getOr(
                        mod,
                        'party_modification.contractor_modification.modification.creation',
                        false
                    );
                case PartyTarget.Shop:
                    return !!getOr(
                        mod,
                        'party_modification.shop_modification.modification.creation',
                        false
                    );
            }
        })
        .map((mod) => {
            const data = getUnionValue(getUnionValue(mod)) as any;
            return {
                id: getOr(data, 'id', null),
                data,
                fromClaim: true,
            };
        });
