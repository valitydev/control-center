import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Claim, ModificationUnit } from '@vality/domain-proto/lib/claim_management';
import { coerceBoolean } from 'coerce-property';
import isEmpty from 'lodash-es/isEmpty';
import { BehaviorSubject, switchMap } from 'rxjs';
import { filter, first } from 'rxjs/operators';

import { ClaimManagementService } from '@cc/app/api/claim-management';
import { PartyManagementWithUserService } from '@cc/app/api/payment-processing';
import { Patch } from '@cc/app/shared/components/json-viewer';
import { NotificationService } from '@cc/app/shared/services/notification';
import { Color, StatusColor } from '@cc/app/styles';
import { DIALOG_CONFIG, DialogConfig } from '@cc/app/tokens';
import { ConfirmActionDialogComponent } from '@cc/components/confirm-action-dialog';
import { inProgressFrom, progressTo } from '@cc/utils';
import { getUnionValue } from '@cc/utils/get-union-key';

import { AddModificationDialogComponent } from '../add-modification-dialog/add-modification-dialog.component';
import { getModificationNameParts } from './utils/get-modification-name';

@UntilDestroy()
@Component({
    selector: 'cc-modification-unit-timeline-item',
    templateUrl: './modification-unit-timeline-item.component.html',
})
export class ModificationUnitTimelineItemComponent {
    @Input() claim: Claim;
    @Input() modificationUnit: ModificationUnit;

    @Input() @coerceBoolean isLoading: boolean = false;
    @Input() title?: string;
    @Input() icon?: string;
    @Input() color?: StatusColor | Color;
    @Input() patches?: Patch[];

    @Output() claimChanged = new EventEmitter<void>();

    isLoading$ = inProgressFrom(() => this.progress$);

    private progress$ = new BehaviorSubject(0);

    constructor(
        private partyManagementWithUserService: PartyManagementWithUserService,
        private dialog: MatDialog,
        @Inject(DIALOG_CONFIG) private dialogConfig: DialogConfig,
        private claimManagementService: ClaimManagementService,
        private notificationService: NotificationService
    ) {}

    get name() {
        return getModificationNameParts(getUnionValue(this.modificationUnit.modification)).join(
            ': '
        );
    }

    get modification() {
        return getUnionValue(getUnionValue(this.modificationUnit?.modification));
    }

    get hasModificationContent() {
        return !isEmpty(this.modification);
    }

    update() {
        this.partyManagementWithUserService
            .getParty(this.claim.party_id)
            .pipe(
                first(),
                switchMap((party) =>
                    this.dialog
                        .open(AddModificationDialogComponent, {
                            ...this.dialogConfig.large,
                            data: {
                                party,
                                claim: this.claim,
                                modificationUnit: this.modificationUnit,
                            },
                        })
                        .afterClosed()
                ),
                untilDestroyed(this)
            )
            .subscribe((result) => {
                if (result === 'success') this.claimChanged.emit();
            });
    }

    remove() {
        this.dialog
            .open(ConfirmActionDialogComponent, {
                ...this.dialogConfig.medium,
                data: { title: 'Confirm deletion' },
            })
            .afterClosed()
            .pipe(
                filter((result) => result === 'confirm'),
                switchMap(() => this.partyManagementWithUserService.getParty(this.claim.party_id)),
                switchMap((party) =>
                    this.claimManagementService.RemoveModification(
                        party.id,
                        this.claim.id,
                        this.claim.revision,
                        this.modificationUnit.modification_id
                    )
                ),
                progressTo(this.progress$),
                untilDestroyed(this)
            )
            .subscribe({
                next: () => {
                    this.notificationService.success();
                    this.claimChanged.emit();
                },
                error: () => {
                    this.notificationService.error();
                },
            });
    }
}
