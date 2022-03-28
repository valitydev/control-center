import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PartyID } from '@vality/domain-proto';
import { ClaimChangeset } from '@vality/domain-proto/lib/claim_management';
import { BehaviorSubject } from 'rxjs';

import { ChangesetInfo, ChangesetInfoType, toChangesetInfos } from '../changeset-infos';
import { MenuConfigAction, MenuConfigItem } from '../timeline-items/menu-config';
import { ClaimChangesetService } from './claim-changeset.service';

@Component({
    selector: 'cc-claim-changeset',
    templateUrl: 'claim-changeset.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [ClaimChangesetService],
})
export class ClaimChangesetComponent {
    @Input()
    createdAt: string;

    @Input()
    set changeset(v: ClaimChangeset) {
        this.changesetInfos$.next(toChangesetInfos(v));
    }

    @Input()
    partyID: PartyID;

    fileMenuConfig: MenuConfigItem[] = [
        { action: MenuConfigAction.deleteFile, label: 'Delete file' },
    ];
    commentMenuConfig: MenuConfigItem[] = [
        { action: MenuConfigAction.deleteComment, label: 'Delete comment' },
    ];
    partyModMenuConfig: MenuConfigItem[] = [];

    changesetInfoType = ChangesetInfoType;
    changesetInfos$ = new BehaviorSubject<ChangesetInfo[]>([]);
    filteredChangesetInfos: ChangesetInfo[] = [];

    constructor(private claimChangesetService: ClaimChangesetService) {}

    simpleTrackBy(index: number): number {
        return index;
    }

    filterChange($event: ChangesetInfo[]) {
        this.filteredChangesetInfos = $event;
    }

    menuItemSelected($event: MenuConfigItem, i: number) {
        this.claimChangesetService.menuItemSelected($event, this.changesetInfos$.getValue(), i);
    }
}
