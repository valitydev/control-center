import { Component, Injector } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
    Claim,
    ModificationUnit,
    PartyModification,
    PartyModificationChange,
} from '@vality/domain-proto/claim_management';
import { Party } from '@vality/domain-proto/domain';
import { DialogResponseStatus, DialogSuperclass, DEFAULT_DIALOG_CONFIG } from '@vality/ng-core';
import { BehaviorSubject } from 'rxjs';

import { ClaimManagementService } from '@cc/app/api/claim-management';
import { NotificationService } from '@cc/app/shared/services/notification';
import { inProgressFrom, progressTo } from '@cc/utils';

import { NotificationErrorService } from '../../../../shared/services/notification-error';

@UntilDestroy()
@Component({
    selector: 'cc-add-modification-dialog',
    templateUrl: './add-modification-dialog.component.html',
})
export class AddModificationDialogComponent extends DialogSuperclass<
    AddModificationDialogComponent,
    { party: Party; claim: Claim; modificationUnit?: ModificationUnit }
> {
    static defaultDialogConfig = DEFAULT_DIALOG_CONFIG.large;

    control = this.fb.control<PartyModification | PartyModificationChange>(
        this.dialogData.modificationUnit?.modification?.party_modification || null,
        Validators.required
    );
    isLoading$ = inProgressFrom(() => this.progress$);

    get isUpdate() {
        return !!this.dialogData.modificationUnit;
    }

    private progress$ = new BehaviorSubject(0);

    constructor(
        injector: Injector,
        private fb: FormBuilder,
        private claimManagementService: ClaimManagementService,
        private notificationService: NotificationService,
        private notificationErrorService: NotificationErrorService
    ) {
        super(injector);
    }

    add() {
        const { party, claim } = this.dialogData;
        this.claimManagementService
            .UpdateClaim(party.id, claim.id, claim.revision, [
                { party_modification: this.control.value },
            ])
            .pipe(progressTo(this.progress$), untilDestroyed(this))
            .subscribe({
                next: () => {
                    this.notificationService.success('Modification added successfully');
                    this.dialogRef.close({ status: DialogResponseStatus.Success });
                },
                error: this.notificationErrorService.error,
            });
    }

    update() {
        const { party, claim, modificationUnit } = this.dialogData;
        this.claimManagementService
            .UpdateModification(
                party.id,
                claim.id,
                claim.revision,
                modificationUnit.modification_id,
                { party_modification: this.control.value }
            )
            .pipe(progressTo(this.progress$), untilDestroyed(this))
            .subscribe({
                next: () => {
                    this.notificationService.success('Modification updated successfully');
                    this.dialogRef.close({ status: DialogResponseStatus.Success });
                },
                error: this.notificationErrorService.error,
            });
    }

    cancel() {
        this.dialogRef.close({ status: DialogResponseStatus.Cancelled });
    }
}
