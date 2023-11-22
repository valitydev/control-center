import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DomainObject, Reference } from '@vality/domain-proto/domain';
import {
    ConfirmDialogComponent,
    DialogResponseStatus,
    DialogService,
    NotifyLogService,
} from '@vality/ng-core';
import { filter, switchMap } from 'rxjs/operators';

import { DomainStoreService } from '../../../../../api/domain-config';

@Injectable({
    providedIn: 'root',
})
export class DomainObjectService {
    constructor(
        private router: Router,
        private dialogService: DialogService,
        private domainStoreService: DomainStoreService,
        private log: NotifyLogService,
    ) {}

    edit(ref: Reference) {
        return this.router.navigate(['domain', 'edit'], {
            queryParams: { ref: JSON.stringify(ref) },
        });
    }

    delete(domainObject: DomainObject) {
        return this.dialogService
            .open(ConfirmDialogComponent, { title: 'Delete object' })
            .afterClosed()
            .pipe(
                filter(({ status }) => status === DialogResponseStatus.Success),
                switchMap(() =>
                    this.domainStoreService.commit({
                        ops: [{ remove: { object: domainObject } }],
                    }),
                ),
            )
            .subscribe({
                next: () => {
                    this.log.successOperation('delete', 'domain object');
                },
                error: this.log.error,
            });
    }
}
