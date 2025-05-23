import { DestroyRef, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Reference } from '@vality/domain-proto/domain';
import {
    ConfirmDialogComponent,
    DialogResponseStatus,
    DialogService,
    NotifyLogService,
} from '@vality/matez';
import { filter, first, switchMap } from 'rxjs/operators';

import {
    Domain2StoreService,
    DomainService,
    FetchDomainObjectsService,
} from '../../../../../api/domain-config';
import { CreateDomainObjectDialogComponent } from '../create-domain-object-dialog';
import { EditDomainObjectDialogComponent } from '../edit-domain-object-dialog';

@Injectable({
    providedIn: 'root',
})
export class DomainObjectService {
    constructor(
        private dialogService: DialogService,
        private domainService: DomainService,
        private log: NotifyLogService,
        private domainStoreService: Domain2StoreService,
        private dr: DestroyRef,
        private fetchDomainObjectsService: FetchDomainObjectsService,
    ) {}

    delete(ref: Reference) {
        return this.dialogService
            .open(ConfirmDialogComponent, { title: 'Delete object' })
            .afterClosed()
            .pipe(
                filter((r) => r.status === DialogResponseStatus.Success),
                switchMap(() => this.domainService.remove([ref])),
                takeUntilDestroyed(this.dr),
            )
            .subscribe({
                next: () => {
                    this.log.successOperation('delete', 'domain object');
                },
                error: this.log.error,
            });
    }

    edit(ref: Reference) {
        this.domainStoreService
            .getObject(ref)
            .pipe(
                first(),
                switchMap((domainObject) =>
                    this.dialogService
                        .open(EditDomainObjectDialogComponent, { domainObject })
                        .afterClosed(),
                ),
                takeUntilDestroyed(this.dr),
            )
            .subscribe();
    }

    create(objectType?: keyof Reference) {
        this.dialogService
            .open(CreateDomainObjectDialogComponent, objectType ? { objectType } : undefined)
            .afterClosed()
            .subscribe((result) => {
                if (result.status === DialogResponseStatus.Success) {
                    this.fetchDomainObjectsService.reload();
                }
            });
    }
}
