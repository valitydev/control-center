import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, Validators } from '@angular/forms';
import { ThriftAstMetadata } from '@vality/domain-proto';
import { DomainObject } from '@vality/domain-proto/domain';
import { NotifyLogService, getImportValue } from '@vality/ng-core';
import { BehaviorSubject } from 'rxjs';
import { withLatestFrom, shareReplay } from 'rxjs/operators';

import { DomainStoreService } from '@cc/app/api/domain-config';

import { progressTo, getUnionKey } from '../../../../utils';
import { DomainMetadataViewExtensionsService } from '../../../shared/components/thrift-api-crud/domain/domain-thrift-viewer/services/domain-metadata-view-extensions';
import { DomainMetadataFormExtensionsService } from '../../../shared/services';
import { NotificationService } from '../../../shared/services/notification';
import { DomainNavigateService } from '../services/domain-navigate.service';
import { MetadataService } from '../services/metadata.service';

@Component({
    templateUrl: './domain-obj-creation.component.html',
    styleUrls: ['../editor-container.scss'],
})
export class DomainObjCreationComponent {
    control = new FormControl<DomainObject>(null, Validators.required);
    review = false;

    metadata$ = getImportValue<ThriftAstMetadata[]>(
        import('@vality/domain-proto/metadata.json'),
    ).pipe(shareReplay({ refCount: true, bufferSize: 1 }));
    extensions$ = this.domainMetadataFormExtensionsService.extensions$;
    viewerExtensions$ = this.domainMetadataViewExtensionsService.extensions$;
    progress$ = new BehaviorSubject(0);

    constructor(
        private domainMetadataFormExtensionsService: DomainMetadataFormExtensionsService,
        private domainMetadataViewExtensionsService: DomainMetadataViewExtensionsService,
        private domainStoreService: DomainStoreService,
        private notificationService: NotificationService,
        private log: NotifyLogService,
        private domainNavigateService: DomainNavigateService,
        private metadataService: MetadataService,
        private destroyRef: DestroyRef,
    ) {}

    reviewChanges() {
        this.review = true;
    }

    commit() {
        this.domainStoreService
            .commit({ ops: [{ insert: { object: this.control.value } }] })
            .pipe(
                withLatestFrom(
                    this.metadataService.getDomainObjectDataFieldByName(
                        getUnionKey(this.control.value),
                    ),
                ),
                progressTo(this.progress$),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: ([, field]) => {
                    this.notificationService.success('Successfully created');
                    void this.domainNavigateService.toType(String(field.type));
                },
                error: this.log.error,
            });
    }
}
