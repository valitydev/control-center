import { ModificationUnit } from '@vality/domain-proto/lib/claim_management';

import { ChangesetInfo, ChangesetInfoType } from './changeset-info';
import { markOutdated } from './mark-outdated';

const getDocumentChangesetInfoHash = (): string => `${ChangesetInfoType.documentModification}`;

const makeDocumentChangesetInfo = (unit: ModificationUnit): ChangesetInfo =>
    ({
        createdAt: unit.created_at,
        modification: unit.modification,
        userInfo: unit.user_info,
        type: ChangesetInfoType.documentModification,
        hash: getDocumentChangesetInfoHash(),
    } as ChangesetInfo);

export const toDocumentModificationChangesetInfo = (
    infos: ChangesetInfo[],
    unit: ModificationUnit
): ChangesetInfo[] => {
    const documentChangesetInfo = makeDocumentChangesetInfo(unit);
    return [...markOutdated(infos, documentChangesetInfo.hash), documentChangesetInfo];
};
