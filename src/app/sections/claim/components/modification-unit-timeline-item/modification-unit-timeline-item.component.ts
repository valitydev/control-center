import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Claim, ModificationUnit } from '@vality/domain-proto/lib/claim_management';
import { BaseDialogResponseStatus, BaseDialogService } from '@vality/ng-core';
import { coerceBoolean } from 'coerce-property';
import isEmpty from 'lodash-es/isEmpty';
import { BehaviorSubject, switchMap } from 'rxjs';
import { filter, first } from 'rxjs/operators';

import { ClaimManagementService } from '@cc/app/api/claim-management';
import { PartyManagementService } from '@cc/app/api/payment-processing';
import { getModificationName } from '@cc/app/sections/claim/utils/get-modification-name';
import { Patch } from '@cc/app/shared/components/json-viewer';
import { NotificationService } from '@cc/app/shared/services/notification';
import { Color, StatusColor } from '@cc/app/styles';
import { ConfirmActionDialogComponent } from '@cc/components/confirm-action-dialog';
import { inProgressFrom, progressTo } from '@cc/utils';
import { getUnionValue } from '@cc/utils/get-union-key';

import { AddModificationDialogComponent } from '../add-modification-dialog/add-modification-dialog.component';

@UntilDestroy()
@Component({
    selector: 'cc-modification-unit-timeline-item',
    templateUrl: './modification-unit-timeline-item.component.html',
})
export class ModificationUnitTimelineItemComponent {
    @Input() claim: Claim;
    @Input() modificationUnit: ModificationUnit;

    @Input() @coerceBoolean isLoading: boolean = false;
    @Input() @coerceBoolean isChangeable: boolean = false;
    @Input() title?: string;
    @Input() icon?: string;
    @Input() color?: StatusColor | Color;
    @Input() patches?: Patch[];

    @Output() claimChanged = new EventEmitter<void>();

    isLoading$ = inProgressFrom(() => this.progress$);

    private progress$ = new BehaviorSubject(0);

    constructor(
        private partyManagementService: PartyManagementService,
        private baseDialogService: BaseDialogService,
        private claimManagementService: ClaimManagementService,
        private notificationService: NotificationService
    ) {}

    get name() {
        return getModificationName(this.modificationUnit.modification);
    }

    get modification() {
        return getUnionValue(getUnionValue(this.modificationUnit?.modification));
    }

    get hasModificationContent() {
        return !isEmpty(this.modification);
    }

    update() {
        this.partyManagementService
            .Get(this.claim.party_id)
            .pipe(
                first(),
                switchMap((party) =>
                    this.baseDialogService
                        .open(AddModificationDialogComponent, {
                            party,
                            claim: this.claim,
                            modificationUnit: this.modificationUnit,
                        })
                        .afterClosed()
                ),
                untilDestroyed(this)
            )
            .subscribe((result) => {
                if (result.status === BaseDialogResponseStatus.Success) this.claimChanged.emit();
            });
    }

    remove() {
        this.baseDialogService
            .open(ConfirmActionDialogComponent, { title: 'Confirm deletion' })
            .afterClosed()
            .pipe(
                filter(({ status }) => status === BaseDialogResponseStatus.Success),
                switchMap(() => this.partyManagementService.Get(this.claim.party_id)),
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
