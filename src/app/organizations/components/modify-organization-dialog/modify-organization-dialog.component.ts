import isEqual from 'lodash-es/isEqual';

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { disabled, form, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';

import { DialogModule, DialogSuperclass, NotifyLogService, progressTo } from '@vality/matez';
import { domain } from '@vality/org-management-proto/admin_management';

import { ThriftOrganizationManagementService } from '~/api/services';

import {
    OrganizationFormComponent,
    OrganizationFormValue,
} from '../organization-form/organization-form.component';

@Component({
    selector: 'cc-modify-organization-dialog',
    imports: [DialogModule, MatButtonModule, OrganizationFormComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './modify-organization-dialog.component.html',
})
export class ModifyOrganizationDialogComponent extends DialogSuperclass<
    ModifyOrganizationDialogComponent,
    domain.Organization
> {
    private organizationsService = inject(ThriftOrganizationManagementService);
    private log = inject(NotifyLogService);

    controlModel = signal<OrganizationFormValue>({
        name: this.dialogData.name || '',
        party_id: this.dialogData.party_id,
        owner_id: this.dialogData.owner_id,
        metadata: this.dialogData.metadata ?? '',
        allowed_ips: Array.from(this.dialogData.allowed_ips ?? []),
    });

    progress = signal(0);

    control = form(this.controlModel, (schemaPath) => {
        required(schemaPath.name);
        disabled(schemaPath, () => this.progress() > 0);
    });

    modify() {
        if (this.progress() || this.control().invalid()) {
            return;
        }
        const { name, metadata, allowed_ips } = this.controlModel();
        const allowedIps = new Set(allowed_ips.map((ip) => ip.trim()).filter(Boolean));
        const ipsChanged = !isEqual(allowedIps, this.dialogData.allowed_ips ?? new Set());
        this.organizationsService
            .modifyOrganization(this.dialogData.id, {
                name,
                ...(metadata !== (this.dialogData.metadata ?? '') ? { metadata } : {}),
                ...(ipsChanged ? { allowed_ips: allowedIps } : {}),
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
