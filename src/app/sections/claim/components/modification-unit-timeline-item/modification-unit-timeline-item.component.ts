import {
    Component,
    EventEmitter,
    Input,
    Output,
    booleanAttribute,
    DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Claim, ModificationUnit } from '@vality/domain-proto/claim_management';
import {
    DialogResponseStatus,
    DialogService,
    ConfirmDialogComponent,
    NotifyLogService,
    inProgressFrom,
    progressTo,
    getImportValue,
} from '@vality/ng-core';
import { getUnionValue, ThriftAstMetadata } from '@vality/ng-thrift';
import isEmpty from 'lodash-es/isEmpty';
import { BehaviorSubject, switchMap } from 'rxjs';
import { filter, first } from 'rxjs/operators';

import { ClaimManagementService } from '@cc/app/api/claim-management';
import { PartyManagementService } from '@cc/app/api/payment-processing';
import { getModificationName } from '@cc/app/sections/claim/utils/get-modification-name';
import { DomainMetadataViewExtensionsService } from '@cc/app/shared/components/thrift-api-crud/domain/domain-thrift-viewer/services/domain-metadata-view-extensions';
import { Color, StatusColor } from '@cc/app/styles';

import { AddModificationDialogComponent } from '../add-modification-dialog/add-modification-dialog.component';

@Component({
    selector: 'cc-modification-unit-timeline-item',
    templateUrl: './modification-unit-timeline-item.component.html',
})
export class ModificationUnitTimelineItemComponent {
    @Input() claim: Claim;
    @Input() modificationUnit: ModificationUnit;

    @Input({ transform: booleanAttribute }) isLoading: boolean = false;
    @Input({ transform: booleanAttribute }) isChangeable: boolean = false;
    @Input() title?: string;
    @Input() icon?: string;
    @Input() color?: StatusColor | Color;

    @Output() claimChanged = new EventEmitter<void>();

    isLoading$ = inProgressFrom(() => this.progress$);
    metadata$ = getImportValue<ThriftAstMetadata[]>(import('@vality/domain-proto/metadata.json'));
    extensions$ = this.domainMetadataViewExtensionsService.extensions$;

    private progress$ = new BehaviorSubject(0);

    constructor(
        private partyManagementService: PartyManagementService,
        private dialogService: DialogService,
        private claimManagementService: ClaimManagementService,
        private log: NotifyLogService,
        private domainMetadataViewExtensionsService: DomainMetadataViewExtensionsService,
        private destroyRef: DestroyRef,
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
                        .afterClosed(),
                ),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((result) => {
                if (result.status === DialogResponseStatus.Success) {
                    this.claimChanged.emit();
                }
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
                        this.modificationUnit.modification_id,
                    ),
                ),
                progressTo(this.progress$),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: () => {
                    this.log.success();
                    this.claimChanged.emit();
                },
                error: this.log.error,
            });
    }
}
