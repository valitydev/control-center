import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { PayoutToolModification } from '@vality/domain-proto/lib/payment_processing';
import get from 'lodash-es/get';

enum Type {
    Creation = 'creation',
    InfoModification = 'info_modification',
}

@Component({
    selector: 'cc-contract-payout-tool-modification',
    templateUrl: 'payout-tool-modification.component.html',
})
export class PayoutToolModificationComponent implements OnInit {
    @Input()
    form: UntypedFormGroup;

    @Input()
    initialValue: PayoutToolModification;

    types = [Type.Creation, Type.InfoModification];

    selected: Type;

    t = Type;

    constructor(private fb: UntypedFormBuilder) {}

    ngOnInit() {
        const creation = get(this, 'initialValue.creation', '');
        const infoModification = get(this, 'initialValue.info_modification', '');
        if (creation) {
            this.selected = Type.Creation;
        }
        if (infoModification) {
            this.selected = Type.InfoModification;
        }
        this.select();
        this.form.updateValueAndValidity();
    }

    select() {
        switch (this.selected) {
            case Type.Creation:
                this.form.registerControl(Type.Creation, this.fb.group({}));
                this.form.removeControl(Type.InfoModification);
                break;
            case Type.InfoModification:
                this.form.registerControl(Type.InfoModification, this.fb.group({}));
                this.form.removeControl(Type.Creation);
                break;
        }
    }
}
