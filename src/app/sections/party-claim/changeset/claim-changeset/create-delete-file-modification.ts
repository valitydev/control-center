import { Modification } from '@vality/domain-proto/lib/claim_management';

import { ChangesetInfo } from '../changeset-infos';

export const createDeleteFileModification = (info: ChangesetInfo): Modification => ({
    claim_modification: {
        file_modification: {
            id: info.modification.claim_modification.file_modification.id,
            modification: {
                deletion: {},
            },
        },
    },
});
