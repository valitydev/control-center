import { DomainObject } from '@vality/domain-proto';
import { PickByValue } from 'utility-types';

import { MetadataFormExtensionOption } from '../../../components/metadata-form';

type DomainRefDataObjects = PickByValue<
    DomainObject,
    {
        ref: { id: number | string };
        data: { name?: string; id?: string };
    }
>;
export type OtherDomainObjects = Omit<DomainObject, keyof DomainRefDataObjects>;
export const DOMAIN_OBJECTS_TO_OPTIONS: {
    [N in keyof OtherDomainObjects]-?: (o: OtherDomainObjects[N]) => MetadataFormExtensionOption;
} = {
    /* eslint-disable @typescript-eslint/naming-convention */
    currency: (o) => ({ value: o.ref.symbolic_code, label: o.data.name, details: o }),
    payment_method: null,
    globals: null,
    identity_provider: (o) => ({ value: o.ref.id, details: o }),
    dummy_link: (o) => ({ value: o.ref.id, label: o.data.link.id, details: o }),
    /* eslint-enable @typescript-eslint/naming-convention */
};

export function defaultDomainObjectToOption(o: DomainRefDataObjects[keyof DomainRefDataObjects]) {
    let label: string;
    if ('name' in o.data) label = o.data.name;
    if ('id' in o.data && !label) label = (o.data as unknown as { id: string }).id;
    return { value: o.ref.id, label, details: o };
}
