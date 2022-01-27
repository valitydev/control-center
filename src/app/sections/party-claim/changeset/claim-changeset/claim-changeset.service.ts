import { Injectable } from '@angular/core';

import { ChangesetInfo } from '../changeset-infos';
import { MenuConfigAction, MenuConfigItem } from '../timeline-items/menu-config';
import { UnsavedClaimChangesetService } from '../unsaved-changeset/unsaved-claim-changeset.service';
import { createDeleteCommentModification } from './create-delete-comment-modification';
import { createDeleteFileModification } from './create-delete-file-modification';

@Injectable()
export class ClaimChangesetService {
    constructor(private unsavedClaimChangesetService: UnsavedClaimChangesetService) {}

    menuItemSelected($event: MenuConfigItem, changesetInfos: ChangesetInfo[], index: number) {
        const changesetInfo = changesetInfos[index];
        switch ($event.action) {
            case MenuConfigAction.deleteComment:
                this.unsavedClaimChangesetService.addModification(
                    createDeleteCommentModification(changesetInfo)
                );
                break;
            case MenuConfigAction.deleteFile:
                this.unsavedClaimChangesetService.addModification(
                    createDeleteFileModification(changesetInfo)
                );
                break;
            default:
                console.warn('Unsupported method', $event);
        }
    }
}
