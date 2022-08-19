import { Injectable } from '@angular/core';
import { Contract, Party, PartyContractor, Shop } from '@vality/domain-proto/lib/domain';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PartyManagementService } from '@cc/app/api/payment-processing';

import { PartyTarget } from '../party-target';
import { SelectableItem } from './selectable-item';

@Injectable()
export class PartyTargetService {
    constructor(private partyManagementService: PartyManagementService) {}

    getSelectableItems(partyID: string, targetName: PartyTarget): Observable<SelectableItem[]> {
        return this.partyManagementService.Get(partyID).pipe(
            map((party) => {
                const result = [];
                const target = this.getTarget(party, targetName);
                target.forEach((item, id) => result.push({ data: item, id, checked: false }));
                return result;
            })
        );
    }

    private getTarget(
        party: Party,
        targetName: PartyTarget
    ): Map<string, Contract | Shop | PartyContractor> {
        switch (targetName) {
            case PartyTarget.contract:
                return party.contracts;
            case PartyTarget.shop:
                return party.shops;
            case PartyTarget.contractor:
                return party.contractors;
        }
    }
}
