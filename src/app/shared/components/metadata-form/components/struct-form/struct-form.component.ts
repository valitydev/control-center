import { Component, Input, OnChanges } from '@angular/core';
import { ValidationErrors, Validator } from '@angular/forms';
import { FormControl, FormGroup } from '@ngneat/reactive-forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormComponentSuperclass } from '@s-libs/ng-core';
import { Field } from '@vality/thrift-ts';
import { Subscription } from 'rxjs';

import { createValidatedAbstractControlProviders } from '@cc/utils';

import { MetadataFormData } from '../../types/metadata-form-data';

@UntilDestroy()
@Component({
    selector: 'cc-struct-form',
    templateUrl: './struct-form.component.html',
    providers: createValidatedAbstractControlProviders(StructFormComponent),
})
export class StructFormComponent
    extends FormComponentSuperclass<{ [N in string]: unknown }>
    implements OnChanges, Validator
{
    @Input() data: MetadataFormData<string, Field[]>;

    control: FormGroup<{ [N in string]: unknown }>;

    private controlSub: Subscription;

    ngOnChanges() {
        this.control = new FormGroup(
            Object.fromEntries(this.data.ast.map(({ name }) => [name, new FormControl()]))
        );
        this.controlSub?.unsubscribe();
        this.control.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
            this.emitOutgoingValue(value);
        });
    }

    validate(): ValidationErrors | null {
        return this.control.invalid ? { invalid: true } : null;
    }

    handleIncomingValue(value: { [N in string]: unknown }) {
        this.control.patchValue(value);
    }

    get hasLabel() {
        let parent: MetadataFormData = this.data.parent;
        while (parent?.objectType === 'typedef') {
            parent = parent?.parent;
        }
        return parent?.objectType !== 'union' && this.data.field;
    }
}
