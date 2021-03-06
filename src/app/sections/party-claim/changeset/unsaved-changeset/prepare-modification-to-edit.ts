import { CountryCode } from '@vality/domain-proto';
import { PartyModification } from '@vality/domain-proto/lib/claim_management';
import cloneDeep from 'lodash-es/cloneDeep';

export const prepareModificationToEdit = (modification: PartyModification): PartyModification => {
    const prepared = cloneDeep(modification);
    const countryObject =
        prepared?.contractor_modification?.modification?.creation?.legal_entity
            ?.international_legal_entity?.country;
    if (countryObject && typeof countryObject === 'object') {
        prepared.contractor_modification.modification.creation.legal_entity.international_legal_entity.country =
            CountryCode[countryObject.id] as any;
    }
    return prepared;
};
