import { Component, Injector, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ValidationErrors, Validator } from '@angular/forms';
import { FormBuilder, FormControl } from '@ngneat/reactive-forms';
import { UntilDestroy } from '@ngneat/until-destroy';
import { WrappedControlSuperclass } from '@s-libs/ng-core';
import { Field } from '@vality/thrift-ts';

import { createValidatedAbstractControlProviders } from '@cc/utils';

import { MetadataFormData } from '../../types/metadata-form-data';

@UntilDestroy()
@Component({
    selector: 'cc-struct-form',
    templateUrl: './struct-form.component.html',
    providers: createValidatedAbstractControlProviders(StructFormComponent),
})
export class StructFormComponent
    extends WrappedControlSuperclass<{ [N in string]: unknown }>
    implements OnChanges, Validator
{
    @Input() data: MetadataFormData<string, Field[]>;

    control = this.fb.group<{ [N in string]: unknown }>({});

    constructor(injector: Injector, private fb: FormBuilder) {
        super(injector);
    }

    ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);
        const newControlsNames = new Set(this.data.ast.map(({ name }) => name));
        Object.keys(this.control.controls).forEach((name) => {
            if (newControlsNames.has(name)) newControlsNames.delete(name);
            else this.control.removeControl(name);
        });
        newControlsNames.forEach((name) => this.control.addControl(name, new FormControl()));
    }

    validate(): ValidationErrors | null {
        return this.control.invalid ? { invalid: true } : null;
    }

    get hasLabel() {
        let parent: MetadataFormData = this.data.parent;
        while (parent?.objectType === 'typedef') {
            parent = parent?.parent;
        }
        return parent?.objectType !== 'union' && this.data.field;
    }
}
