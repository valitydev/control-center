import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { LegalEntity } from '@vality/domain-proto/lib/domain';
import get from 'lodash-es/get';

enum Type {
    RussianLegalEntity = 'russian_legal_entity',
    InternationalLegalEntity = 'international_legal_entity',
}

@Component({
    selector: 'cc-legal-entity',
    templateUrl: 'legal-entity.component.html',
})
export class LegalEntityComponent implements OnInit {
    @Input()
    form: UntypedFormGroup;

    @Input()
    initialValue: LegalEntity;

    types = [Type.RussianLegalEntity, Type.InternationalLegalEntity];

    selected: Type;

    t = Type;

    constructor(private fb: UntypedFormBuilder) {}

    ngOnInit(): void {
        const russianLegalEntity = get(this, 'initialValue.russian_legal_entity', null);
        const internationalLegalEntity = get(this, 'initialValue.international_legal_entity', null);
        if (russianLegalEntity) {
            this.selected = Type.RussianLegalEntity;
            this.select();
        }
        if (internationalLegalEntity) {
            this.selected = Type.InternationalLegalEntity;
            this.select();
        }
    }

    select(): void {
        switch (this.selected) {
            case Type.RussianLegalEntity:
                this.form.removeControl(Type.InternationalLegalEntity);
                this.form.registerControl(Type.RussianLegalEntity, this.fb.group({}));
                break;
            case Type.InternationalLegalEntity:
                this.form.removeControl(Type.RussianLegalEntity);
                this.form.registerControl(Type.InternationalLegalEntity, this.fb.group({}));
                break;
        }
        this.form.updateValueAndValidity();
    }
}
