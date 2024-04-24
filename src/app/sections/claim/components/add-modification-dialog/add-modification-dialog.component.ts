import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Validators, FormBuilder } from '@angular/forms';
import { Claim, ModificationUnit } from '@vality/domain-proto/claim_management';
import { Party } from '@vality/domain-proto/domain';
import { ModificationChange, Modification } from '@vality/domain-proto/internal/claim_management';
import {
    DialogSuperclass,
    DEFAULT_DIALOG_CONFIG,
    NotifyLogService,
    inProgressFrom,
    progressTo,
} from '@vality/ng-core';
import { BehaviorSubject } from 'rxjs';
import { DeepPartial } from 'utility-types';

import { ClaimManagementService } from '@cc/app/api/claim-management';

@Component({
    selector: 'cc-add-modification-dialog',
    templateUrl: './add-modification-dialog.component.html',
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
    static defaultDialogConfig = DEFAULT_DIALOG_CONFIG.large;

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

    constructor(
        private fb: FormBuilder,
        private claimManagementService: ClaimManagementService,
        private log: NotifyLogService,
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
