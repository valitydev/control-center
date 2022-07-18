import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Field, ValueType } from '@vality/thrift-ts';

import { ThriftAstMetadata } from '@cc/app/api/utils';
import { MetadataFormExtension } from '@cc/app/shared/components/metadata-form/types/metadata-form-extension';

import { createControlProviders, ValidatedFormControlSuperclass } from '../../../../utils';
import { MetadataFormData } from './types/metadata-form-data';

@Component({
    selector: 'cc-metadata-form',
    templateUrl: './metadata-form.component.html',
    providers: createControlProviders(MetadataFormComponent),
})
export class MetadataFormComponent<T>
    extends ValidatedFormControlSuperclass<T>
    implements OnChanges
{
    @Input() metadata: ThriftAstMetadata[];
    @Input() namespace: string;
    @Input() type: ValueType;
    @Input() field?: Field;
    @Input() parent?: MetadataFormData;
    @Input() extensions?: MetadataFormExtension[];

    data: MetadataFormData;

    ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);
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
