import { ModificationUnit } from '@vality/domain-proto/lib/claim_management';

import { ChangesetInfo, ChangesetInfoType } from './changeset-info';
import { toCommentModificationChangesetInfo } from './to-comment-modification-changeset-info';
import { toDocumentModificationChangesetInfo } from './to-document-modification-changeset-info';
import { toFileModificationChangesetInfo } from './to-file-modification-changeset-info';
import { toPartyModificationChangesetInfo } from './to-party-modification-changeset-info';
import { toStatusModificationChangesetInfo } from './to-status-modification-changeset-info';

const getModificationType = (unit: ModificationUnit): ChangesetInfoType | null => {
    if (unit.modification.party_modification) {
        return ChangesetInfoType.partyModification;
    } else if (unit.modification.claim_modification.comment_modification) {
        return ChangesetInfoType.commentModification;
    } else if (unit.modification.claim_modification.file_modification) {
        return ChangesetInfoType.fileModification;
    } else if (unit.modification.claim_modification.document_modification) {
        return ChangesetInfoType.documentModification;
    } else if (unit.modification.claim_modification.status_modification) {
        return ChangesetInfoType.statusModification;
    } else {
        return null;
    }
};

export const toChangesetInfos = (units: ModificationUnit[]): ChangesetInfo[] =>
    units.reduce((acc, cur) => {
        switch (getModificationType(cur)) {
            case ChangesetInfoType.partyModification:
                return toPartyModificationChangesetInfo(acc, cur);
            case ChangesetInfoType.commentModification:
                return toCommentModificationChangesetInfo(acc, cur);
            case ChangesetInfoType.fileModification:
                return toFileModificationChangesetInfo(acc, cur);
            case ChangesetInfoType.documentModification:
                return toDocumentModificationChangesetInfo(acc, cur);
            case ChangesetInfoType.statusModification:
                return toStatusModificationChangesetInfo(acc, cur);
            default:
                console.error('Changeset infos: Unknown type', cur);
                return acc;
        }
    }, []);
