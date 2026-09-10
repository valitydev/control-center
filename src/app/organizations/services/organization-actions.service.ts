import { EMPTY } from 'rxjs';
import { catchError, filter, switchMap, tap } from 'rxjs/operators';

import { Injectable, inject } from '@angular/core';

import {
    ConfirmDialogComponent,
    DialogResponseStatus,
    DialogService,
    NotifyLogService,
} from '@vality/matez';
import { domain } from '@vality/org-management-proto/admin_management';

import { ThriftOrganizationManagementService } from '~/api/services';

import {
    CreateOrganizationDialogComponent,
    CreateOrganizationDialogData,
} from '../components/create-organization-dialog';
import { ModifyOrganizationDialogComponent } from '../components/modify-organization-dialog';

@Injectable({
    providedIn: 'root',
})
export class OrganizationActionsService {
    private dialogService = inject(DialogService);
    private organizationsService = inject(ThriftOrganizationManagementService);
    private log = inject(NotifyLogService);

    create(data?: CreateOrganizationDialogData) {
        return this.dialogService
            .open(CreateOrganizationDialogComponent, data)
            .afterClosed()
            .pipe(filter((res) => res?.status === 'success'));
    }

    modify(org: domain.Organization) {
        return this.dialogService
            .open(ModifyOrganizationDialogComponent, { organization: org })
            .afterClosed()
            .pipe(filter((res) => res?.status === 'success'));
    }

    deactivate(org: domain.Organization) {
        return this.dialogService
            .open(ConfirmDialogComponent, {
                title: `Deactivate organization "${org.name}"`,
                confirmLabel: 'Deactivate',
            })
            .afterClosed()
            .pipe(
                filter(({ status }) => status === DialogResponseStatus.Success),
                switchMap(() =>
                    this.organizationsService.DeactivateOrganization(org.id).pipe(
                        catchError((err) => {
                            this.log.error(err);
                            return EMPTY;
                        }),
                    ),
                ),
                tap(() => {
                    this.log.success('Organization deactivated');
                }),
            );
    }

    activate(org: domain.Organization) {
        return this.dialogService
            .open(ConfirmDialogComponent, {
                title: `Activate organization "${org.name}"`,
                confirmLabel: 'Activate',
            })
            .afterClosed()
            .pipe(
                filter(({ status }) => status === DialogResponseStatus.Success),
                switchMap(() =>
                    this.organizationsService.ActivateOrganization(org.id).pipe(
                        catchError((err) => {
                            this.log.error(err);
                            return EMPTY;
                        }),
                    ),
                ),
                tap(() => {
                    this.log.success('Organization activated');
                }),
            );
    }
}
