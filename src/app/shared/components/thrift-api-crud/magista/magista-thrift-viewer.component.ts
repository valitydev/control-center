import { Observable } from 'rxjs';

import { Component, inject } from '@angular/core';

import { metadata$ } from '@vality/magista-proto';
import { ThriftViewExtension } from '@vality/ng-thrift';

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
    metadata$ = metadata$;
    override extensions$: Observable<ThriftViewExtension[]> =
        this.domainMetadataViewExtensionsService.extensions$;
}
