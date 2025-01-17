import { Component, inject } from '@angular/core';
import { ThriftAstMetadata } from '@vality/domain-proto';
import { getImportValue } from '@vality/matez';
import { Observable } from 'rxjs';

import { MetadataViewExtension } from '../../json-viewer';
import { DomainMetadataViewExtensionsService } from '../domain/domain-thrift-viewer/services/domain-metadata-view-extensions';
import { ThriftViewerBaseModule, ThriftViewerSuperclass } from '../utils';

@Component({
    selector: 'cc-magista-thrift-viewer',
    template: `<cc-thrift-viewer-base [data]="data()" />`,
    imports: [ThriftViewerBaseModule],
})
export class MagistaThriftViewerComponent<T> extends ThriftViewerSuperclass<T> {
    domainMetadataViewExtensionsService = inject(DomainMetadataViewExtensionsService);

    defaultNamespace = 'magista';
    metadata$ = getImportValue<ThriftAstMetadata[]>(import('@vality/magista-proto/metadata.json'));
    override extensions$: Observable<MetadataViewExtension[]> =
        this.domainMetadataViewExtensionsService.extensions$;
}
