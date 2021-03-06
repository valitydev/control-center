import { FileModification, ModificationUnit } from '@vality/domain-proto/lib/claim_management';

import { getUnionKey } from '@cc/utils/get-union-key';

import { ChangesetInfo, ChangesetInfoModificationType, ChangesetInfoType } from './changeset-info';
import { markRemoved } from './mark-removed';

const getFileChangesetInfoHash = (unit: ModificationUnit): string =>
    `${ChangesetInfoType.fileModification}.${unit.modification.claim_modification.file_modification.id}`;

const fileModificationType = (mod: FileModification): ChangesetInfoModificationType => {
    switch (getUnionKey(mod)) {
        case 'creation':
            return ChangesetInfoModificationType.creation;
        case 'deletion':
            return ChangesetInfoModificationType.deletion;
    }
};

const makeFileChangesetInfo = (unit: ModificationUnit): ChangesetInfo =>
    ({
        createdAt: unit.created_at,
        modification: unit.modification,
        userInfo: unit.user_info,
        type: ChangesetInfoType.fileModification,
        hash: getFileChangesetInfoHash(unit),
        modificationType: fileModificationType(
            unit.modification.claim_modification.file_modification.modification
        ),
    } as ChangesetInfo);

export const toFileModificationChangesetInfo = (
    infos: ChangesetInfo[],
    unit: ModificationUnit
): ChangesetInfo[] => {
    const fileChangesetInfo = makeFileChangesetInfo(unit);
    return [...markRemoved(infos, fileChangesetInfo.hash), fileChangesetInfo];
};
