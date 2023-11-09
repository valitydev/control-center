import { CommonModule } from '@angular/common';
import { Component, Input, booleanAttribute } from '@angular/core';
import { ThriftAstMetadata } from '@vality/domain-proto';
import { getImportValue } from '@vality/ng-core';
import { ValueType } from '@vality/thrift-ts';

import { ThriftViewerModule } from '../../../thrift-viewer';

import { DomainMetadataViewExtensionsService } from './services/domain-metadata-view-extensions';

@Component({
    standalone: true,
    selector: 'cc-domain-thrift-viewer',
    templateUrl: './domain-thrift-viewer.component.html',
    imports: [CommonModule, ThriftViewerModule],
})
export class DomainThriftViewerComponent<T> {
    @Input() value: T;
    @Input() type: ValueType;
    @Input({ transform: booleanAttribute }) progress: boolean = false;
    // @Input() extensions?: MetadataViewExtension[];

    metadata$ = getImportValue<ThriftAstMetadata[]>(import('@vality/domain-proto/metadata.json'));
    extensions$ = this.domainMetadataViewExtensionsService.extensions$;

    constructor(private domainMetadataViewExtensionsService: DomainMetadataViewExtensionsService) {}
}
