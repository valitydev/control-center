import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ThriftAstMetadata } from '@vality/fistful-proto';
import { FormControlSuperclass, createControlProviders } from '@vality/ng-core';
import { from } from 'rxjs';

import { MetadataFormModule, MetadataFormExtension } from '../../../metadata-form';

@Component({
    standalone: true,
    selector: 'cc-magista-thrift-form',
    templateUrl: './magista-thrift-form.component.html',
    providers: createControlProviders(() => MagistaThriftFormComponent),
    imports: [CommonModule, ReactiveFormsModule, MetadataFormModule],
})
export class MagistaThriftFormComponent extends FormControlSuperclass<unknown> {
    @Input() namespace: string;
    @Input() type: string;

    metadata$ = from(
        import('@vality/magista-proto/metadata.json').then((m) => m.default as ThriftAstMetadata[]),
    );
    extensions: MetadataFormExtension[] = [];
}
