import { filter, first, switchMap } from 'rxjs/operators';

import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Reference } from '@vality/domain-proto/domain';
import {
    ConfirmDialogComponent,
    DialogResponseStatus,
    DialogService,
    NotifyLogService,
    subscribeReturn,
} from '@vality/matez';

import { DomainService } from '~/api/domain-config';
import { SidenavInfoService } from '~/components/sidenav-info';

import { CreateDomainObjectDialogComponent } from '../create-domain-object-dialog';
import { DomainObjectCardComponent } from '../domain-object-card';
import { DomainObjectHistoryCardComponent } from '../domain-object-history-card';
import { EditDomainObjectDialogComponent } from '../edit-domain-object-dialog';

@Injectable({
    providedIn: 'root',
})
export class DomainObjectService {
    private dialogService = inject(DialogService);
    private domainService = inject(DomainService);
    private sidenavInfoService = inject(SidenavInfoService);
    private log = inject(NotifyLogService);
    private dr = inject(DestroyRef);

    delete(ref: Reference) {
        return subscribeReturn(
            this.dialogService
                .open(ConfirmDialogComponent, { title: 'Delete object' })
                .afterClosed()
                .pipe(
                    filter((r) => r.status === DialogResponseStatus.Success),
                    switchMap(() => this.domainService.commit([{ remove: { ref } }])),
                    takeUntilDestroyed(this.dr),
                ),
            {
                next: () => {
                    this.log.successOperation('delete', 'domain object');
                },
                error: this.log.error,
            },
        );
    }

    view(ref: Reference, version?: number) {
        return this.sidenavInfoService.toggle(DomainObjectCardComponent, { ref, version });
    }

    edit(ref: Reference) {
        return subscribeReturn(
            this.domainService.get(ref).pipe(
                first(),
                switchMap((domainObject) =>
                    this.dialogService
                        .open(EditDomainObjectDialogComponent, { domainObject })
                        .afterClosed(),
                ),
                takeUntilDestroyed(this.dr),
            ),
        );
    }

    history(ref: Reference) {
        return this.sidenavInfoService.toggle(DomainObjectHistoryCardComponent, { ref });
    }

    create(objectType?: keyof Reference) {
        return subscribeReturn(
            this.dialogService
                .open(CreateDomainObjectDialogComponent, objectType ? { objectType } : undefined)
                .afterClosed(),
        );
    }
}
