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

export interface CreateOrganizationDialogData {
    partyId?: domain.PartyID;
}

@Component({
    selector: 'cc-create-organization-dialog',
    imports: [DialogModule, MatButtonModule, OrganizationFormComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './create-organization-dialog.component.html',
})
export class CreateOrganizationDialogComponent extends DialogSuperclass<
    CreateOrganizationDialogComponent,
    CreateOrganizationDialogData | void
> {
    private organizationsService = inject(ThriftOrganizationManagementService);
    private log = inject(NotifyLogService);

    partyId = (this.dialogData as CreateOrganizationDialogData)?.partyId;

    controlModel = signal<OrganizationFormValue>({
        name: '',
        party_id: this.partyId ?? '',
        owner_id: '',
        metadata: '',
        allowed_ips: [],
    });

    progress = signal(0);

    control = form(this.controlModel, (schemaPath) => {
        required(schemaPath.name);
        required(schemaPath.party_id);
        required(schemaPath.owner_id);
        disabled(schemaPath, () => this.progress() > 0);
    });

    create() {
        if (this.progress() || this.control().invalid()) {
            return;
        }
        const { allowed_ips, metadata, ...request } = this.controlModel();
        const allowedIps = new Set(allowed_ips.map((ip) => ip.trim()).filter(Boolean));
        this.organizationsService
            .createOrganization({
                ...request,
                ...(metadata ? { metadata } : {}),
                ...(allowedIps.size ? { allowed_ips: allowedIps } : {}),
            })
            .pipe(progressTo(this.progress))
            .subscribe({
                next: () => {
                    this.log.success('Organization created');
                    this.closeWithSuccess();
                },
                error: (err) => {
                    this.log.error(err);
                },
            });
    }
}
