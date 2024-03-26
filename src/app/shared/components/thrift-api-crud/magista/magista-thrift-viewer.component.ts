import { Component, inject } from '@angular/core';
import { ThriftAstMetadata } from '@vality/domain-proto';
import { getImportValue } from '@vality/ng-core';
import { Observable } from 'rxjs';

import { MetadataViewExtension } from '../../json-viewer';
import { DomainMetadataViewExtensionsService } from '../domain/domain-thrift-viewer/services/domain-metadata-view-extensions';
import { ThriftViewerSuperclass, ThriftViewerBaseModule } from '../utils';

@Component({
    standalone: true,
    selector: 'cc-magista-thrift-viewer',
    template: `<cc-thrift-viewer-base [data]="data" />`,
    imports: [ThriftViewerBaseModule],
})
export class MagistaThriftViewerComponent<T> extends ThriftViewerSuperclass<T> {
    domainMetadataViewExtensionsService = inject(DomainMetadataViewExtensionsService);

    defaultNamespace = 'magista';
    metadata$ = getImportValue<ThriftAstMetadata[]>(import('@vality/magista-proto/metadata.json'));
    extensions$: Observable<MetadataViewExtension[]> =
        this.domainMetadataViewExtensionsService.extensions$;
}
