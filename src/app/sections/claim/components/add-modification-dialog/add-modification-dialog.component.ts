import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder } from '@ngneat/reactive-forms';
import { PartyID } from '@vality/domain-proto';
import { ClaimID, ClaimRevision } from '@vality/domain-proto/lib/base';
import { Modification } from '@vality/domain-proto/lib/claim_management';
import { from } from 'rxjs';

import { ClaimManagementService } from '@cc/app/api/claim-management';

@Component({
    selector: 'cc-add-modification-dialog',
    templateUrl: './add-modification-dialog.component.html',
})
export class AddModificationDialogComponent {
    control = this.fb.control<Modification>(null);
    metadata$ = from(import('@vality/domain-proto/lib/metadata.json').then((m) => m.default));

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<AddModificationDialogComponent>,
        @Inject(MAT_DIALOG_DATA)
        private dialogData: { party_id: PartyID; id: ClaimID; revision: ClaimRevision },
        private claimManagementService: ClaimManagementService
    ) {}

    add() {
        console.log(this.control.value);
        // this.claimManagementService.UpdateClaim(
        //     this.dialogData.party_id,
        //     this.dialogData.id,
        //     this.dialogData.revision,
        //     {}
        // );
        this.dialogRef.close();
    }

    cancel() {
        this.dialogRef.close();
    }
}
