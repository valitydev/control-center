import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { DomainObject, Reference } from '@vality/domain-proto/lib/domain';
import { BaseDialogService, BaseDialogResponseStatus } from '@vality/ng-core';
import { from } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

import { DomainStoreService } from '@cc/app/api/deprecated-damsel';
import { QueryParamsService } from '@cc/app/shared/services';
import { DomainMetadataViewExtensionsService } from '@cc/app/shared/services/domain-metadata-view-extensions';

import { ConfirmActionDialogComponent } from '../../../../components/confirm-action-dialog';
import { enumHasValue } from '../../../../utils';
import { ViewerKind } from '../../../shared/components/thrift-viewer';
import { ErrorService } from '../../../shared/services/error';
import { NotificationService } from '../../../shared/services/notification';

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
    metadata$ = from(import('@vality/domain-proto/lib/metadata.json').then((m) => m.default));
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
        private baseDialogService: BaseDialogService,
        private notificationService: NotificationService,
        private errorService: ErrorService,
        private domainMetadataViewExtensionsService: DomainMetadataViewExtensionsService,
        private queryParamsService: QueryParamsService<{ ref?: Reference }>
    ) {}

    edit() {
        void this.router.navigate(['domain', 'edit', JSON.stringify(this.objWithRef.ref)]);
    }

    delete() {
        this.baseDialogService
            .open(ConfirmActionDialogComponent, { title: 'Delete object' })
            .afterClosed()
            .pipe(
                untilDestroyed(this),
                filter(({ status }) => status === BaseDialogResponseStatus.Success),
                switchMap(() =>
                    this.domainStoreService.commit({
                        ops: [{ remove: { object: this.objWithRef.obj } }],
                    })
                )
            )
            .subscribe({
                next: () => {
                    this.notificationService.success('Successfully removed');
                },
                error: (err) => {
                    this.errorService.error(err);
                },
            });
    }

    close() {
        this.objWithRef = null;
        void this.queryParamsService.patch({ ref: null });
    }
}
