import { Component, Input, OnChanges } from '@angular/core';
import { FormControl, FormGroup } from '@ngneat/reactive-forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormComponentSuperclass, provideValueAccessor } from '@s-libs/ng-core';
import { Field } from '@vality/thrift-ts';
import { Subscription } from 'rxjs';

import { MetadataFormData } from '../../types/metadata-form-data';

@UntilDestroy()
@Component({
    selector: 'cc-struct-form',
    templateUrl: './struct-form.component.html',
    providers: [provideValueAccessor(StructFormComponent)],
})
export class StructFormComponent
    extends FormComponentSuperclass<{ [N in string]: unknown }>
    implements OnChanges
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

    handleIncomingValue(value: { [N in string]: unknown }) {
        // this.data.ast.forEach(({name}) => this.control.get(name).patchValue())
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
