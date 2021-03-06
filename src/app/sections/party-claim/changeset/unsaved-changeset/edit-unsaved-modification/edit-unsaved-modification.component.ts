import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PartyModification } from '@vality/domain-proto/lib/claim_management';

import { prepareModificationsToBackend } from '@cc/app/shared/components/party-modification-creator/create-modification-dialog/prepare-modifications-to-backend';
import { getUnionKey, getUnionValue } from '@cc/utils/get-union-key';

type ModificationType =
    | 'contractor_modification'
    | 'contract_modification'
    | 'shop_modification'
    | 'wallet_modification';

@Component({
    templateUrl: 'edit-unsaved-modification.component.html',
})
export class EditUnsavedModificationComponent {
    mod = this.data;
    form: UntypedFormGroup = this.fb.group({});
    modType: ModificationType = getUnionKey<PartyModification>(this.data);

    constructor(
        private dialogRef: MatDialogRef<EditUnsavedModificationComponent>,
        private fb: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) private data: PartyModification
    ) {}

    save(): void {
        const modificationUnit = getUnionValue(this.mod);
        this.dialogRef.close({
            party_modification: prepareModificationsToBackend({
                [getUnionKey(this.mod)]: {
                    id: modificationUnit.id,
                    modification: {
                        [getUnionKey(modificationUnit.modification)]: this.form.value,
                    },
                },
            }),
        });
    }
}
