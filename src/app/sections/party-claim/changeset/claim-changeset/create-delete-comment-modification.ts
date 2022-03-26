import { Modification } from '@vality/domain-proto/lib/claim_management';

import { ChangesetInfo } from '../changeset-infos';

export const createDeleteCommentModification = (info: ChangesetInfo): Modification => ({
    claim_modification: {
        comment_modification: {
            id: info.modification.claim_modification.comment_modification.id,
            modification: {
                deletion: {},
            },
        },
    },
});
