import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ThriftAstMetadata } from '@vality/fistful-proto';
import { FormControlSuperclass, createControlProviders } from '@vality/ng-core';
import { from, of } from 'rxjs';
import short from 'short-uuid';

import { MetadataFormModule, isTypeWithAliases, MetadataFormExtension } from '../metadata-form';

@Component({
    standalone: true,
    selector: 'cc-fistful-thrift-form',
    templateUrl: './fistful-thrift-form.component.html',
    providers: createControlProviders(() => FistfulThriftFormComponent),
    imports: [CommonModule, ReactiveFormsModule, MetadataFormModule],
})
export class FistfulThriftFormComponent extends FormControlSuperclass<unknown> {
    @Input() namespace: string;
    @Input() type: string;

    metadata$ = from(
        import('@vality/fistful-proto/metadata.json').then((m) => m.default as ThriftAstMetadata[])
    );
    extensions: MetadataFormExtension[] = [
        {
            determinant: (data) => of(isTypeWithAliases(data, 'SourceID', 'fistful')),
            extension: () => of({ generate: () => of(short().uuid()), isIdentifier: true }),
        },
    ];
}
