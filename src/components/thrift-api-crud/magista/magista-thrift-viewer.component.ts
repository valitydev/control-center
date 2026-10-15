import { Observable, from } from 'rxjs';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { loadThriftMetadata } from '@vality/magista-proto/magista';
import { ThriftViewExtension } from '@vality/ng-thrift';

import { DomainMetadataViewExtensionsService } from '../domain/domain-thrift-viewer/services/domain-metadata-view-extensions';
import { ThriftViewerBaseModule, ThriftViewerSuperclass } from '../utils';

@Component({
    selector: 'cc-magista-thrift-viewer',
    template: `<cc-thrift-viewer-base [data]="data()" />`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ThriftViewerBaseModule],
})
export class MagistaThriftViewerComponent<T> extends ThriftViewerSuperclass<T> {
    domainMetadataViewExtensionsService = inject(DomainMetadataViewExtensionsService);

    defaultNamespace = 'magista';
    metadata$ = from(loadThriftMetadata());
    override extensions$: Observable<ThriftViewExtension[]> =
        this.domainMetadataViewExtensionsService.extensions$;
}
