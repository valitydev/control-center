import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder } from '@ngneat/reactive-forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Claim, Modification } from '@vality/domain-proto/lib/claim_management';
import { Party } from '@vality/domain-proto/lib/domain';
import { BehaviorSubject, from, of } from 'rxjs';
import uuid from 'uuid';

import { ClaimManagementService } from '@cc/app/api/claim-management';
import { getByType, MetadataFormExtension } from '@cc/app/shared/components/metadata-form';
import { NotificationService } from '@cc/app/shared/services/notification';
import { progressTo } from '@cc/utils';

function createPartyOptions(values: IterableIterator<{ id: string }>) {
    return Array.from(values).map((value) => ({
        label: `${value.id} (from party)`,
        details: value,
        value: value.id,
    }));
}

function createClaimOptions(modificationUnits: { id: string; modification: unknown }[]) {
    return modificationUnits.filter(Boolean).map((unit) => ({
        label: `${unit.id} (from claim)`,
        details: unit.modification,
        value: unit.id,
    }));
}

function generate() {
    return of(uuid());
}

@UntilDestroy()
@Component({
    selector: 'cc-add-modification-dialog',
    templateUrl: './add-modification-dialog.component.html',
})
export class AddModificationDialogComponent {
    control = this.fb.control<Modification>(null);
    metadata$ = from(import('@vality/domain-proto/lib/metadata.json').then((m) => m.default));
    extensions: MetadataFormExtension[] = [
        {
            determinant: (data) => of(!!getByType(data, 'ContractorID', 'domain')),
            extension: () =>
                of({
                    options: [
                        ...createPartyOptions(this.dialogData.party.contractors.values()),
                        ...createClaimOptions(
                            this.dialogData.claim.changeset.map(
                                (unit) =>
                                    unit.modification.party_modification?.contractor_modification
                            )
                        ),
                    ],
                    generate,
                }),
        },
        {
            determinant: (data) => of(!!getByType(data, 'ContractID', 'domain')),
            extension: () =>
                of({
                    options: [
                        ...createPartyOptions(this.dialogData.party.contracts.values()),
                        ...createClaimOptions(
                            this.dialogData.claim.changeset.map(
                                (unit) =>
                                    unit.modification.party_modification?.contract_modification
                            )
                        ),
                    ],
                    generate,
                }),
        },
        {
            determinant: (data) => of(!!getByType(data, 'ShopID', 'domain')),
            extension: () =>
                of({
                    options: [
                        ...createPartyOptions(this.dialogData.party.shops.values()),
                        ...createClaimOptions(
                            this.dialogData.claim.changeset.map(
                                (unit) => unit.modification.party_modification?.shop_modification
                            )
                        ),
                    ],
                    generate,
                }),
        },
        {
            determinant: (data) => of(!!getByType(data, 'WalletID', 'domain')),
            extension: () =>
                of({
                    options: [
                        ...createPartyOptions(this.dialogData.party.wallets.values()),
                        ...createClaimOptions(
                            this.dialogData.claim.changeset.map(
                                (unit) => unit.modification.party_modification?.wallet_modification
                            )
                        ),
                    ],
                    generate,
                }),
        },
        {
            determinant: (data) => of(!!getByType(data, 'ID', 'base')),
            extension: () => of({ generate }),
        },
    ];
    progress$ = new BehaviorSubject(0);

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<AddModificationDialogComponent>,
        @Inject(MAT_DIALOG_DATA)
        private dialogData: { party: Party; claim: Claim },
        private claimManagementService: ClaimManagementService,
        private notificationService: NotificationService
    ) {}

    add() {
        this.claimManagementService
            .UpdateClaim(
                this.dialogData.party.id,
                this.dialogData.claim.id,
                this.dialogData.claim.revision,
                [this.control.value]
            )
            .pipe(progressTo(this.progress$), untilDestroyed(this))
            .subscribe({
                next: () => {
                    this.notificationService.success('Modification added successfully');
                    this.dialogRef.close('success');
                },
                error: (err) => {
                    console.error(err);
                    this.notificationService.error('Error adding modification');
                },
            });
    }

    cancel() {
        this.dialogRef.close();
    }
}
