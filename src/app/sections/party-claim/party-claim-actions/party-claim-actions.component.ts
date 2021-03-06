import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import { PartyID } from '@vality/domain-proto';
import { ClaimChangeset, ClaimStatus } from '@vality/domain-proto/lib/claim_management';
import { map, take } from 'rxjs/operators';

import { PartyModificationCreatorDialogService } from '@cc/app/shared/components';

import { UnsavedClaimChangesetService } from '../changeset/unsaved-changeset/unsaved-claim-changeset.service';
import { StatusChangerService } from './status-changer';
import { getAvailableClaimStatuses } from './status-changer/get-available-claim-statuses';

@Component({
    selector: 'cc-party-claim-actions',
    templateUrl: 'party-claim-actions.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartyClaimActionsComponent implements OnInit, OnDestroy {
    @Input()
    partyID: PartyID;

    @Input()
    claimID: string;

    @Input()
    status: ClaimStatus;

    @Input()
    changeset: ClaimChangeset;

    @Output()
    changesetUpdated = new EventEmitter();

    constructor(
        private unsavedClaimChangesetService: UnsavedClaimChangesetService,
        private partyModificationCreatorDialogService: PartyModificationCreatorDialogService,
        private statusChangerService: StatusChangerService
    ) {}

    ngOnInit(): void {
        this.statusChangerService.init();
        this.statusChangerService.statusChanged$.subscribe(() => this.changesetUpdated.emit());
    }

    ngOnDestroy(): void {
        this.statusChangerService.destroy();
    }

    addPartyModification() {
        this.unsavedClaimChangesetService.unsavedChangesetInfos$
            .pipe(
                take(1),
                map((infos) => infos.map((info) => info.modification))
            )
            .subscribe((unsaved) =>
                this.partyModificationCreatorDialogService.open(this.partyID, [
                    ...unsaved,
                    ...this.changeset.map((item) => item.modification),
                ])
            );
    }

    changeStatus() {
        this.statusChangerService.changeStatus(this.partyID, this.claimID, this.status);
    }

    canChangeStatus(): boolean {
        return getAvailableClaimStatuses(this.status).length > 0;
    }
}
