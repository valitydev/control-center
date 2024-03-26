import { Component, Directive, Input, booleanAttribute, input } from '@angular/core';
import { ThriftAstMetadata } from '@vality/domain-proto';
import { ValueType } from '@vality/thrift-ts';
import { Observable, of } from 'rxjs';

import { MetadataViewExtension } from '../../../json-viewer';
import { ViewerKind } from '../../../thrift-viewer';

interface Data<T> {
    kind: ViewerKind;
    value: T;
    compared?: T;
    type: ValueType;
    progress: boolean;
    namespace: string;
    metadata$: Observable<ThriftAstMetadata[]>;
    extensions: MetadataViewExtension[];
    extensions$: Observable<MetadataViewExtension[]>;
}

@Component({
    selector: 'cc-thrift-viewer-base',
    templateUrl: './thrift-viewer-base.component.html',
})
export class ThriftViewerBaseComponent<T> {
    data = input.required<Data<T>>();
}

@Directive()
export abstract class ThriftViewerSuperclass<T> {
    @Input() kind = ViewerKind.Component;
    @Input() value: T;
    @Input() compared?: T;
    @Input() type: ValueType;
    @Input({ transform: booleanAttribute }) progress = false;
    @Input() extensions: MetadataViewExtension[] = [];
    @Input() namespace?: string;

    abstract defaultNamespace: string;
    abstract metadata$: Observable<ThriftAstMetadata[]>;
    extensions$: Observable<MetadataViewExtension[]> = of([]);

    get data() {
        return {
            kind: this.kind,
            value: this.value,
            compared: this.compared,
            type: this.type,
            progress: this.progress,
            namespace: this.namespace || this.defaultNamespace,
            metadata$: this.metadata$,
            extensions: this.extensions,
            extensions$: this.extensions$,
        };
    }
}
