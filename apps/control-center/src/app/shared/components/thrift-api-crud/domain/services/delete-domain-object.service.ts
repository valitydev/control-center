import { Injectable, inject } from '@angular/core';
import { Reference } from '@vality/domain-proto/domain';
import {
    ConfirmDialogComponent,
    DialogResponseStatus,
    DialogService,
    NotifyLogService,
} from '@vality/matez';
import { filter, first, switchMap } from 'rxjs/operators';

import { DomainStoreService } from '../../../../../api/domain-config';

@Injectable({
    providedIn: 'root',
})
export class DeleteDomainObjectService {
    private dialogService = inject(DialogService);
    private domainStoreService = inject(DomainStoreService);
    private log = inject(NotifyLogService);

    delete(domainRef: Reference) {
        return this.dialogService
            .open(ConfirmDialogComponent, { title: 'Delete object' })
            .afterClosed()
            .pipe(
                filter((r) => r.status === DialogResponseStatus.Success),
                switchMap(() => this.domainStoreService.getObject(domainRef, true).pipe(first())),
                switchMap((obj) =>
                    this.domainStoreService.commit({ ops: [{ remove: { object: obj } }] }),
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
