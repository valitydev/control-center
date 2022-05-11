import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder } from '@ngneat/reactive-forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Claim, Modification, ModificationUnit } from '@vality/domain-proto/lib/claim_management';
import { Party } from '@vality/domain-proto/lib/domain';
import uniqBy from 'lodash-es/uniqBy';
import { BehaviorSubject, from, of } from 'rxjs';
import uuid from 'uuid';

import { ClaimManagementService } from '@cc/app/api/claim-management';
import { getByType, MetadataFormExtension } from '@cc/app/shared/components/metadata-form';
import { NotificationService } from '@cc/app/shared/services/notification';
import { inProgressFrom, progressTo } from '@cc/utils';

function createPartyOptions(values: IterableIterator<{ id: string }>) {
    return Array.from(values).map((value) => ({
        label: `${value.id} (from party)`,
        details: value,
        value: value.id,
    }));
}

function createClaimOptions(modificationUnits: { id: string; modification: unknown }[]) {
    return uniqBy(
        modificationUnits.filter(Boolean).map((unit) => ({
            label: `${unit.id} (from claim)`,
            details: unit.modification,
            value: unit.id,
        })),
        'value'
    );
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
    control = this.fb.control<Modification>(this.dialogData.modificationUnit?.modification || null);
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
    isLoading$ = inProgressFrom(() => this.progress$);

    get isUpdate() {
        return !!this.dialogData.modificationUnit;
    }

    private progress$ = new BehaviorSubject(0);

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<AddModificationDialogComponent>,
        @Inject(MAT_DIALOG_DATA)
        private dialogData: { party: Party; claim: Claim; modificationUnit?: ModificationUnit },
        private claimManagementService: ClaimManagementService,
        private notificationService: NotificationService
    ) {}

    add() {
        const { party, claim } = this.dialogData;
        this.claimManagementService
            .UpdateClaim(party.id, claim.id, claim.revision, [this.control.value])
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

    update() {
        const { party, claim, modificationUnit } = this.dialogData;
        this.claimManagementService
            .UpdateModification(
                party.id,
                claim.id,
                claim.revision,
                modificationUnit.modification_id,
                this.control.value
            )
            .pipe(progressTo(this.progress$), untilDestroyed(this))
            .subscribe({
                next: () => {
                    this.notificationService.success('Modification updated successfully');
                    this.dialogRef.close('success');
                },
                error: (err) => {
                    console.error(err);
                    this.notificationService.error('Error updating modification');
                },
            });
    }

    cancel() {
        this.dialogRef.close();
    }
}
