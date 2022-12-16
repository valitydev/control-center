import { PartyModification } from '@vality/domain-proto/claim_management';
import { CountryCode } from '@vality/domain-proto/domain';
import cloneDeep from 'lodash-es/cloneDeep';

export const prepareModificationsToBackend = (
    modification: PartyModification
): PartyModification => {
    const prepared = cloneDeep(modification);
    const countryCode =
        prepared?.contractor_modification?.modification?.creation?.legal_entity
            ?.international_legal_entity?.country;
    if (countryCode && typeof countryCode === 'string') {
        prepared.contractor_modification.modification.creation.legal_entity.international_legal_entity.country =
            {
                id: CountryCode[countryCode] as any,
            };
    }
    return prepared;
};
