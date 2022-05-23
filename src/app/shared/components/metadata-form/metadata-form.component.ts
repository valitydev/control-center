import { Component, Input, OnChanges } from '@angular/core';
import { ValidationErrors, Validator } from '@angular/forms';
import { WrappedFormControlSuperclass } from '@s-libs/ng-core';
import { Field, ValueType } from '@vality/thrift-ts';

import { ThriftAstMetadata } from '@cc/app/api/utils';
import { MetadataFormExtension } from '@cc/app/shared/components/metadata-form/types/metadata-form-extension';
import { createValidatedAbstractControlProviders } from '@cc/utils';

import { MetadataFormData } from './types/metadata-form-data';

@Component({
    selector: 'cc-metadata-form',
    templateUrl: './metadata-form.component.html',
    providers: createValidatedAbstractControlProviders(MetadataFormComponent),
})
export class MetadataFormComponent
    extends WrappedFormControlSuperclass<unknown>
    implements OnChanges, Validator
{
    @Input() metadata: ThriftAstMetadata[];
    @Input() namespace: string;
    @Input() type: ValueType;
    @Input() field?: Field;
    @Input() parent?: MetadataFormData;
    @Input() extensions?: MetadataFormExtension[];

    data: MetadataFormData;

    ngOnChanges() {
        if (this.metadata && this.namespace && this.type) {
            this.data = new MetadataFormData(
                this.metadata,
                this.namespace,
                this.type,
                this.field,
                this.parent,
                this.extensions
            );
        }
    }

    validate(): ValidationErrors | null {
        return this.control.errors;
    }
}
