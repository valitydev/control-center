import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DomainObject } from '@vality/domain-proto/lib/domain';
import { BehaviorSubject } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';

import { DomainMetadataViewExtensionsService } from '@cc/app/shared/services/domain-metadata-view-extensions';

import { progressTo, getUnionKey, enumHasValue } from '../../../../utils';
import { EditorKind } from '../../../shared/components/thrift-editor';
import { ViewerKind } from '../../../shared/components/thrift-viewer';
import { DomainMetadataFormExtensionsService } from '../../../shared/services';
import { ErrorService } from '../../../shared/services/error';
import { NotificationService } from '../../../shared/services/notification';
import { DomainStoreService } from '../../../thrift-services/damsel/domain-store.service';
import { DomainNavigateService } from '../services/domain-navigate.service';
import { MetadataService } from '../services/metadata.service';

const EDITOR_KIND = 'domain-obj-creation-editor-kind';
const REVIEW_KIND = 'domain-obj-creation-review-kind';

@UntilDestroy()
@Component({
    templateUrl: './domain-obj-creation.component.html',
    styleUrls: ['../editor-container.scss'],
})
export class DomainObjCreationComponent {
    control = new FormControl<DomainObject>(null, Validators.required);
    review = false;

    metadata$ = this.metadataService.metadata;
    extensions$ = this.domainMetadataFormExtensionsService.extensions$;
    viewerExtensions$ = this.domainMetadataViewExtensionsService.extensions$;
    progress$ = new BehaviorSubject(0);

    get kind() {
        const kind = localStorage.getItem(EDITOR_KIND);
        if (!enumHasValue(EditorKind, kind)) {
            this.kind = EditorKind.Form;
            return EditorKind.Form;
        }
        return kind;
    }
    set kind(kind: EditorKind) {
        localStorage.setItem(EDITOR_KIND, kind);
    }

    get reviewKind() {
        const kind = localStorage.getItem(REVIEW_KIND);
        if (!enumHasValue(ViewerKind, kind)) {
            this.reviewKind = ViewerKind.Editor;
            return ViewerKind.Editor;
        }
        return kind;
    }
    set reviewKind(kind: ViewerKind) {
        localStorage.setItem(REVIEW_KIND, kind);
    }

    constructor(
        private domainMetadataFormExtensionsService: DomainMetadataFormExtensionsService,
        private domainMetadataViewExtensionsService: DomainMetadataViewExtensionsService,
        private domainStoreService: DomainStoreService,
        private notificationService: NotificationService,
        private errorService: ErrorService,
        private domainNavigateService: DomainNavigateService,
        private metadataService: MetadataService
    ) {}

    reviewChanges() {
        this.review = true;
    }

    commit() {
        this.domainStoreService
            .commit({ ops: [{ insert: { object: this.control.value } }] })
            .pipe(
                withLatestFrom(
                    this.metadataService.getDomainFieldByFieldName(getUnionKey(this.control.value))
                ),
                progressTo(this.progress$),
                untilDestroyed(this)
            )
            .subscribe({
                next: ([, field]) => {
                    this.notificationService.success('Successfully created');
                    void this.domainNavigateService.toType(String(field.type));
                },
                error: (err) => {
                    this.errorService.error(err);
                },
            });
    }
}
