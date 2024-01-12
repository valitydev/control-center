import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Validators, FormBuilder } from '@angular/forms';
import { Claim, ModificationUnit } from '@vality/domain-proto/claim_management';
import { Party } from '@vality/domain-proto/domain';
import { ModificationChange, Modification } from '@vality/domain-proto/internal/claim_management';
import { DialogResponseStatus, DialogSuperclass, DEFAULT_DIALOG_CONFIG } from '@vality/ng-core';
import { BehaviorSubject } from 'rxjs';

import { ClaimManagementService } from '@cc/app/api/claim-management';
import { NotificationService } from '@cc/app/shared/services/notification';
import { inProgressFrom, progressTo } from '@cc/utils';

import { NotificationErrorService } from '../../../../shared/services/notification-error';

@Component({
    selector: 'cc-add-modification-dialog',
    templateUrl: './add-modification-dialog.component.html',
})
export class AddModificationDialogComponent extends DialogSuperclass<
    AddModificationDialogComponent,
    { party: Party; claim: Claim; modificationUnit?: ModificationUnit }
> {
    static defaultDialogConfig = DEFAULT_DIALOG_CONFIG.large;

    control = this.fb.control<Modification | ModificationChange>(
        this.dialogData.modificationUnit?.modification || null,
        Validators.required,
    );
    isLoading$ = inProgressFrom(() => this.progress$);

    get isUpdate() {
        return !!this.dialogData.modificationUnit;
    }

    private progress$ = new BehaviorSubject(0);

    constructor(
        private fb: FormBuilder,
        private claimManagementService: ClaimManagementService,
        private notificationService: NotificationService,
        private notificationErrorService: NotificationErrorService,
        private destroyRef: DestroyRef,
    ) {
        super();
    }

    add() {
        const { party, claim } = this.dialogData;
        this.claimManagementService
            .UpdateClaim(party.id, claim.id, claim.revision, [this.control.value])
            .pipe(progressTo(this.progress$), takeUntilDestroyed(this.destroyRef))
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
                this.control.value,
            )
            .pipe(progressTo(this.progress$), takeUntilDestroyed(this.destroyRef))
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
