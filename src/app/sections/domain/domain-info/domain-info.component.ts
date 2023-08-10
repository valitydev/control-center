import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { DomainObject, Reference } from '@vality/domain-proto/domain';
import {
    DialogService,
    DialogResponseStatus,
    ConfirmDialogComponent,
    QueryParamsService,
} from '@vality/ng-core';
import { from } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

import { DomainStoreService } from '@cc/app/api/deprecated-damsel';
import { DomainMetadataViewExtensionsService } from '@cc/app/shared/services/domain-metadata-view-extensions';

import { enumHasValue } from '../../../../utils';
import { ViewerKind } from '../../../shared/components/thrift-viewer';
import { NotificationService } from '../../../shared/services/notification';
import { NotificationErrorService } from '../../../shared/services/notification-error';

const VIEWER_KIND = 'domain-info-kind';

@UntilDestroy()
@Component({
    templateUrl: './domain-info.component.html',
    styleUrls: ['./domain-info.component.scss'],
})
export class DomainInfoComponent {
    @ViewChild('domainObjDetails', { static: true }) detailsContainer: MatSidenav;

    version$ = this.domainStoreService.version$;
    progress$ = this.domainStoreService.isLoading$;
    objWithRef: { obj: DomainObject; ref: Reference } = null;
    metadata$ = from(import('@vality/domain-proto/metadata.json').then((m) => m.default));
    extensions$ = this.domainMetadataViewExtensionsService.extensions$;

    get kind() {
        const kind = localStorage.getItem(VIEWER_KIND);
        if (!enumHasValue(ViewerKind, kind)) {
            this.kind = ViewerKind.Editor;
            return ViewerKind.Editor;
        }
        return kind;
    }
    set kind(kind: ViewerKind) {
        localStorage.setItem(VIEWER_KIND, kind);
    }

    constructor(
        private router: Router,
        private domainStoreService: DomainStoreService,
        private dialogService: DialogService,
        private notificationService: NotificationService,
        private notificationErrorService: NotificationErrorService,
        private domainMetadataViewExtensionsService: DomainMetadataViewExtensionsService,
        private queryParamsService: QueryParamsService<{ ref?: Reference }>,
    ) {}

    edit() {
        void this.router.navigate(['domain', 'edit', JSON.stringify(this.objWithRef.ref)]);
    }

    delete() {
        this.dialogService
            .open(ConfirmDialogComponent, { title: 'Delete object' })
            .afterClosed()
            .pipe(
                untilDestroyed(this),
                filter(({ status }) => status === DialogResponseStatus.Success),
                switchMap(() =>
                    this.domainStoreService.commit({
                        ops: [{ remove: { object: this.objWithRef.obj } }],
                    }),
                ),
            )
            .subscribe({
                next: () => {
                    this.notificationService.success('Successfully removed');
                },
                error: this.notificationErrorService.error,
            });
    }

    close() {
        this.objWithRef = null;
        void this.queryParamsService.patch({ ref: null });
    }
}
