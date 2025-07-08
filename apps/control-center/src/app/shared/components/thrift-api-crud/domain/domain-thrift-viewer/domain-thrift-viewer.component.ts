import { CommonModule } from '@angular/common';
import { Component, Input, booleanAttribute, inject, model } from '@angular/core';
import { metadata$ } from '@vality/domain-proto';
import { UnionEnum } from '@vality/matez';
import { ThriftViewerModule, ViewerKind } from '@vality/ng-thrift';
import { ValueType } from '@vality/thrift-ts';

import { DomainMetadataViewExtensionsService } from './services/domain-metadata-view-extensions';

@Component({
    selector: 'cc-domain-thrift-viewer',
    templateUrl: './domain-thrift-viewer.component.html',
    imports: [CommonModule, ThriftViewerModule],
})
export class DomainThriftViewerComponent<T> {
    private domainMetadataViewExtensionsService = inject(DomainMetadataViewExtensionsService);
    kind = model<UnionEnum<ViewerKind>>(ViewerKind.Component);
    @Input() value: T;
    @Input() compared?: T;
    @Input() type: ValueType;
    @Input({ transform: booleanAttribute }) progress: boolean = false;
    @Input() namespace = 'domain';
    // @Input() extensions?: MetadataViewExtension[];

    metadata$ = metadata$;
    extensions$ = this.domainMetadataViewExtensionsService.extensions$;
}
