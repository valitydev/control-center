import { Observable, of } from 'rxjs';

import { CommonModule } from '@angular/common';
import { Component, Input, booleanAttribute, model } from '@angular/core';

import { metadata$ } from '@vality/fistful-proto';
import { UnionEnum } from '@vality/matez';
import { ThriftViewExtension, ThriftViewerModule, ViewerKind } from '@vality/ng-thrift';
import { ValueType } from '@vality/thrift-ts';

@Component({
    selector: 'cc-fistful-thrift-viewer',
    templateUrl: './fistful-thrift-viewer.component.html',
    imports: [CommonModule, ThriftViewerModule],
})
export class FistfulThriftViewerComponent<T> {
    kind = model<UnionEnum<ViewerKind>>(ViewerKind.Component);
    @Input() value: T;
    @Input() compared?: T;
    @Input() type: ValueType;
    @Input({ transform: booleanAttribute }) progress: boolean = false;
    @Input() namespace = 'domain';
    // @Input() extensions?: MetadataViewExtension[];

    metadata$ = metadata$;
    extensions$: Observable<ThriftViewExtension[]> = of([]); // TODO
}
