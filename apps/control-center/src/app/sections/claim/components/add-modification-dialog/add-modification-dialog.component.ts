import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { Claim, ModificationUnit } from '@vality/domain-proto/claim_management';
import { Party } from '@vality/domain-proto/domain';
import { Modification, ModificationChange } from '@vality/domain-proto/internal/claim_management';
import {
    DEFAULT_DIALOG_CONFIG,
    DialogSuperclass,
    NotifyLogService,
    inProgressFrom,
    progressTo,
} from '@vality/matez';
import { BehaviorSubject } from 'rxjs';
import { DeepPartial } from 'utility-types';

import { ClaimManagementService } from '../../../../api/claim-management/claim-management.service';

@Component({
    selector: 'cc-add-modification-dialog',
    templateUrl: './add-modification-dialog.component.html',
    standalone: false,
})
export class AddModificationDialogComponent extends DialogSuperclass<
    AddModificationDialogComponent,
    {
        party: Party;
        claim: Claim;
        modificationUnit?: ModificationUnit;
        createModification?: DeepPartial<Modification>;
    }
> {
    private fb = inject(FormBuilder);
    private claimManagementService = inject(ClaimManagementService);
    private log = inject(NotifyLogService);
    private destroyRef = inject(DestroyRef);
    static override defaultDialogConfig = DEFAULT_DIALOG_CONFIG.large;

    control = this.fb.control<Modification | ModificationChange>(
        this.dialogData.modificationUnit?.modification ||
            (this.dialogData.createModification as Modification) ||
            null,
        Validators.required,
    );
    isLoading$ = inProgressFrom(() => this.progress$);

    get isUpdate() {
        return !!this.dialogData.modificationUnit;
    }

    private progress$ = new BehaviorSubject(0);

    add() {
        const { party, claim } = this.dialogData;
        this.claimManagementService
            .UpdateClaim(party.id, claim.id, claim.revision, [this.control.value])
            .pipe(progressTo(this.progress$), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.log.success('Modification added successfully');
                    this.closeWithSuccess();
                },
                error: this.log.error,
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
                    this.log.success('Modification updated successfully');
                    this.closeWithSuccess();
                },
                error: this.log.error,
            });
    }
}
