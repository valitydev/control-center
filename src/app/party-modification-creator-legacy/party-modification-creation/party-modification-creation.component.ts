import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormControlStatus, FormGroup, Validators } from '@angular/forms';
import { ContractorModification } from '@vality/domain-proto/lib/claim_management';
import {
    ContractModification,
    PartyModification,
    ShopModification,
} from '@vality/domain-proto/lib/payment_processing';

import { ActionType, ModificationAction } from '../../claim/modification-action';
import {
    ContractModificationName,
    ContractorModificationName,
    ShopModificationName,
} from '../model';
import { filterEmptyStringValues } from './filter-empty-string-value';
import { toPartyModification } from './to-party-modification';

@Component({
    selector: 'cc-party-modification-creation',
    templateUrl: 'party-modification-creation.component.html',
})
export class PartyModificationCreationComponent implements OnInit, OnChanges {
    @Input()
    unitID;

    @Input()
    action: ModificationAction;

    @Input()
    unitIDDisabled;

    @Input()
    modification: ShopModification & ContractModification & ContractorModification; // TODO: bad type, should be '|' instead '&'

    @Output()
    valueChanges: EventEmitter<PartyModification> = new EventEmitter();

    @Output()
    statusChanges: EventEmitter<FormControlStatus> = new EventEmitter();

    actionTypes = ActionType;
    shopModificationNames = ShopModificationName;
    contractModificationNames = ContractModificationName;
    contractorModificationNames = ContractorModificationName;

    form: FormGroup;

    constructor(private fb: FormBuilder) {}

    ngOnInit() {
        this.form = this.fb.group({
            unitID: [
                {
                    value: this.unitID,
                    disabled: this.unitIDDisabled,
                },
                Validators.required,
            ],
            modification: this.fb.group({}),
        });
        this.form.statusChanges.subscribe((status) => this.statusChanges.emit(status));
        this.form.valueChanges.subscribe(() => {
            const filtered = filterEmptyStringValues(this.form.getRawValue());
            const modification = toPartyModification(this.action, filtered);
            this.valueChanges.emit(modification);
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        const { unitID } = changes;
        if (unitID && !unitID.firstChange) {
            this.form.patchValue({ unitID: unitID.currentValue });
        }
    }
}
