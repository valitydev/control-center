import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Claim, ModificationUnit } from '@vality/domain-proto/claim_management';
import { DialogResponseStatus, DialogService, ConfirmDialogComponent } from '@vality/ng-core';
import { coerceBoolean } from 'coerce-property';
import isEmpty from 'lodash-es/isEmpty';
import { BehaviorSubject, switchMap, from } from 'rxjs';
import { filter, first } from 'rxjs/operators';

import { ClaimManagementService } from '@cc/app/api/claim-management';
import { PartyManagementService } from '@cc/app/api/payment-processing';
import { getModificationName } from '@cc/app/sections/claim/utils/get-modification-name';
import { DomainMetadataViewExtensionsService } from '@cc/app/shared/services/domain-metadata-view-extensions';
import { NotificationService } from '@cc/app/shared/services/notification';
import { Color, StatusColor } from '@cc/app/styles';
import { inProgressFrom, progressTo } from '@cc/utils';
import { getUnionValue } from '@cc/utils/get-union-key';

import { NotificationErrorService } from '../../../../shared/services/notification-error';
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

    @Output() claimChanged = new EventEmitter<void>();

    isLoading$ = inProgressFrom(() => this.progress$);
    metadata$ = from(import('@vality/domain-proto/metadata.json').then((m) => m.default));
    extensions$ = this.domainMetadataViewExtensionsService.extensions$;

    private progress$ = new BehaviorSubject(0);

    constructor(
        private partyManagementService: PartyManagementService,
        private dialogService: DialogService,
        private claimManagementService: ClaimManagementService,
        private notificationService: NotificationService,
        private domainMetadataViewExtensionsService: DomainMetadataViewExtensionsService,
        private notificationErrorService: NotificationErrorService
    ) {}

    get name() {
        return getModificationName(this.modificationUnit.modification);
    }

    get hasModificationContent() {
        return !isEmpty(getUnionValue(getUnionValue(this.modificationUnit?.modification)));
    }

    update() {
        this.partyManagementService
            .Get(this.claim.party_id)
            .pipe(
                first(),
                switchMap((party) =>
                    this.dialogService
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
                if (result.status === DialogResponseStatus.Success) this.claimChanged.emit();
            });
    }

    remove() {
        this.dialogService
            .open(ConfirmDialogComponent, { title: 'Confirm deletion' })
            .afterClosed()
            .pipe(
                filter(({ status }) => status === DialogResponseStatus.Success),
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
                error: this.notificationErrorService.error,
            });
    }
}
