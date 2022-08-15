import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { RepresentativeDocument } from '@vality/domain-proto/lib/domain';
import get from 'lodash-es/get';

enum Type {
    ArticlesOfAssociation = 'articles_of_association',
    PowerOfAttorney = 'power_of_attorney',
}

@Component({
    selector: 'cc-representative-document',
    templateUrl: 'representative-document.component.html',
})
export class RepresentativeDocumentComponent implements OnInit {
    @Input()
    form: UntypedFormGroup;

    @Input()
    initialValue: RepresentativeDocument;

    selected: Type;

    types = [Type.ArticlesOfAssociation, Type.PowerOfAttorney];

    t = Type;

    constructor(private fb: UntypedFormBuilder) {}

    ngOnInit() {
        const articlesOfAssociation = get(this, 'initialValue.articles_of_association', null);
        const powerOfAttorney = get(this, 'initialValue.power_of_attorney', null);
        if (articlesOfAssociation) {
            this.selected = Type.ArticlesOfAssociation;
            this.select(articlesOfAssociation);
        }
        if (powerOfAttorney) {
            this.selected = Type.PowerOfAttorney;
            this.select(powerOfAttorney);
        }
        this.form.updateValueAndValidity();
    }

    select(data = {}) {
        switch (this.selected) {
            case Type.ArticlesOfAssociation:
                this.form.registerControl(Type.ArticlesOfAssociation, this.fb.group(data));
                this.form.removeControl(Type.PowerOfAttorney);
                break;
            case Type.PowerOfAttorney:
                this.form.registerControl(Type.PowerOfAttorney, this.fb.group(data));
                this.form.removeControl(Type.ArticlesOfAssociation);
                break;
        }
    }
}
