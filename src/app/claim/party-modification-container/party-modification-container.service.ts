import { Injectable } from '@angular/core';
import {
    ContractModificationUnit,
    ShopModificationUnit,
} from '@vality/domain-proto/lib/payment_processing';

import {
    ContractModificationName,
    ShopModificationName,
} from '../../party-modification-creator-legacy';
import { ModificationGroupType } from '../model';
import { ActionType } from '../modification-action';

@Injectable()
export class PartyModificationContainerService {
    getDialogConfig(
        modification: ShopModificationUnit | ContractModificationUnit,
        name: ContractModificationName | ShopModificationName,
        type: string,
        partyID: string
    ) {
        const actionType = this.getActionType(type);
        const unitID = modification.id;
        return {
            data: {
                action: {
                    type: actionType,
                    name,
                },
                unitID,
                partyID,
                modification,
            },
            width: '800px',
            disableClose: true,
        };
    }

    private getActionType(type): ActionType {
        switch (type) {
            case ModificationGroupType.ContractUnitContainer:
                return ActionType.ContractAction;
            case ModificationGroupType.ShopUnitContainer:
                return ActionType.ShopAction;
        }
    }
}
