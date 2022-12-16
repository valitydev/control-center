import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatLegacyRadioChange as MatRadioChange } from '@angular/material/legacy-radio';
import { Modification } from '@vality/domain-proto/claim_management';

import { PartyTarget } from './party-target';
import { TargetType } from './targe-type';

@Component({
    selector: 'cc-party-modification-target',
    templateUrl: 'party-modification-target.component.html',
})
export class PartyModificationTargetComponent {
    @Input()
    unitID: string;

    @Input()
    partyID: string;

    @Input()
    partyTarget: PartyTarget;

    @Input()
    fromClaim: Modification[];

    @Output()
    valueChanges: EventEmitter<string> = new EventEmitter();

    radioItems = [TargetType.FillIn, TargetType.PartyItem];

    selectedTarget: TargetType = TargetType.FillIn;

    t = TargetType;

    targetChanges(change: MatRadioChange) {
        this.selectedTarget = change.value;
        this.valueChanges.emit('');
    }

    unitIDChanges(unitID: string) {
        this.valueChanges.emit(unitID);
    }
}
