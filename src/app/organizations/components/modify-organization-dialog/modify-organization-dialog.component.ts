import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormField, form, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';

import {
    DialogModule,
    DialogSuperclass,
    InputFieldModule,
    NotifyLogService,
    progressTo,
} from '@vality/matez';
import { domain } from '@vality/org-management-proto/admin_management';

import { ThriftOrganizationManagementService } from '~/api/services';

export interface ModifyOrganizationDialogData {
    organization: domain.Organization;
}

interface ModifyOrganizationModel {
    name: string;
}

@Component({
    selector: 'cc-modify-organization-dialog',
    imports: [CommonModule, DialogModule, MatButtonModule, InputFieldModule, FormField],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './modify-organization-dialog.component.html',
})
export class ModifyOrganizationDialogComponent extends DialogSuperclass<
    ModifyOrganizationDialogComponent,
    ModifyOrganizationDialogData
> {
    private organizationsService = inject(ThriftOrganizationManagementService);
    private log = inject(NotifyLogService);

    controlModel = signal<ModifyOrganizationModel>({
        name: this.dialogData.organization.name || '',
    });

    control = form(this.controlModel, (schemaPath) => {
        required(schemaPath.name);
    });

    progress = signal(0);

    modify() {
        const { name } = this.controlModel();
        this.organizationsService
            .ModifyOrganization(this.dialogData.organization.id, {
                name,
            })
            .pipe(progressTo(this.progress))
            .subscribe({
                next: () => {
                    this.log.success('Organization updated');
                    this.closeWithSuccess();
                },
                error: (err) => {
                    this.log.error(err);
                },
            });
    }
}
