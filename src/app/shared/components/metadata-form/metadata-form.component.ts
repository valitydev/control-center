import { Component, Input, OnChanges } from '@angular/core';
import { Validator } from '@angular/forms';
import { Field, ValueType } from '@vality/thrift-ts';

import { ThriftAstMetadata } from '@cc/app/api/utils';
import { createControlProviders, ValidatedFormControlSuperclass } from '@cc/utils';

import { MetadataFormData } from './types/metadata-form-data';
import { MetadataFormExtension } from './types/metadata-form-extension';

@Component({
    selector: 'cc-metadata-form',
    templateUrl: './metadata-form.component.html',
    providers: createControlProviders(MetadataFormComponent),
})
export class MetadataFormComponent<T>
    extends ValidatedFormControlSuperclass<T>
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
}
