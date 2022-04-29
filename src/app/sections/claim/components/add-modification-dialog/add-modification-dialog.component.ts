import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder } from '@ngneat/reactive-forms';
import { Claim, Modification } from '@vality/domain-proto/lib/claim_management';
import { Party } from '@vality/domain-proto/lib/domain';
import { from, of } from 'rxjs';
import uuid from 'uuid';

import { ClaimManagementService } from '@cc/app/api/claim-management';
import { PartyManagementWithUserService } from '@cc/app/api/payment-processing';
import { MetadataFormExtension } from '@cc/app/shared/components/metadata-form/types/metadata-form-data';

@Component({
    selector: 'cc-add-modification-dialog',
    templateUrl: './add-modification-dialog.component.html',
})
export class AddModificationDialogComponent {
    control = this.fb.control<Modification>(null);
    metadata$ = from(import('@vality/domain-proto/lib/metadata.json').then((m) => m.default));
    extensions: MetadataFormExtension[] = [
        {
            determinant: (data) =>
                of(
                    !![data, ...data.path].find(
                        (d) => d.type === 'ContractorID' && d.namespace === 'domain'
                    )
                ),
            extension: () =>
                of({
                    options: [
                        ...Array.from(this.dialogData.party.contractors).map(([, contractor]) => ({
                            label: contractor.id + ` (from party)`,
                            details: contractor,
                            value: contractor.id,
                        })),
                        ...this.dialogData.claim.changeset
                            .map(
                                (unit) =>
                                    unit.modification.party_modification?.contractor_modification
                            )
                            .filter((unit) => !!unit)
                            .map((unit) => ({
                                label: unit.id + ` (from claim)`,
                                details: unit.modification,
                                value: unit.id,
                            })),
                    ],
                    generate: () => of(uuid()),
                }),
        },
    ];

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<AddModificationDialogComponent>,
        @Inject(MAT_DIALOG_DATA)
        private dialogData: { party: Party; claim: Claim },
        private claimManagementService: ClaimManagementService,
        private partyManagementWithUserService: PartyManagementWithUserService
    ) {
        console.log(dialogData);
    }

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
