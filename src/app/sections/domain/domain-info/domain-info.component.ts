import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { DomainObject, Reference } from '@vality/domain-proto/domain';
import {
    DialogService,
    DialogResponseStatus,
    ConfirmDialogComponent,
    QueryParamsService,
    NotifyLogService,
} from '@vality/ng-core';
import { filter, switchMap } from 'rxjs/operators';

import { DomainStoreService } from '@cc/app/api/domain-config';

@UntilDestroy()
@Component({
    templateUrl: './domain-info.component.html',
    styleUrls: ['./domain-info.component.scss'],
})
export class DomainInfoComponent {
    version$ = this.domainStoreService.version$;
    progress$ = this.domainStoreService.isLoading$;
    objWithRef: { obj: DomainObject; ref: Reference } = null;

    constructor(
        private router: Router,
        private domainStoreService: DomainStoreService,
        private dialogService: DialogService,
        private log: NotifyLogService,
        private queryParamsService: QueryParamsService<{ ref?: Reference }>,
    ) {}

    edit() {
        void this.router.navigate(['domain', 'edit'], {
            queryParams: { ref: JSON.stringify(this.objWithRef.ref) },
        });
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
                    this.log.success('Successfully removed');
                },
                error: this.log.error,
            });
    }

    close() {
        this.objWithRef = null;
        void this.queryParamsService.patch({ ref: null });
    }
}
