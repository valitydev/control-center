import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
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
import { MerchantFieldModule } from '~/components/merchant-field';

export interface CreateOrganizationDialogData {
    partyId?: domain.PartyID;
}

interface CreateOrganizationModel {
    name: string;
    party_id: domain.PartyID;
    owner_id: domain.UserID;
}

@Component({
    selector: 'cc-create-organization-dialog',
    imports: [
        CommonModule,
        DialogModule,
        ReactiveFormsModule,
        MatButtonModule,
        MerchantFieldModule,
        InputFieldModule,
        FormField,
    ],
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

    controlModel = signal<CreateOrganizationModel>({
        name: '',
        party_id: this.partyId || '',
        owner_id: '',
    });

    control = form(this.controlModel, (schemaPath) => {
        required(schemaPath.name);
        required(schemaPath.party_id);
        required(schemaPath.owner_id);
    });

    progress = signal(0);

    create() {
        const { name, party_id, owner_id } = this.controlModel();
        this.organizationsService
            .CreateOrganization({
                name,
                party_id,
                owner_id,
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
