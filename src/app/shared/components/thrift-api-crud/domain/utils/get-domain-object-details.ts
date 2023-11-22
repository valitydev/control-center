import { DomainObject } from '@vality/domain-proto/domain';
import { inlineJson } from '@vality/ng-core';
import { PickByValue, ValuesType } from 'utility-types';

import { getUnionKey, getUnionValue } from '../../../../../../utils';

export interface DomainObjectDetails {
    id: number | string;
    label: string;
}

type GetDomainObjectDetails<TObject extends ValuesType<DomainObject> = ValuesType<DomainObject>> = <
    T extends TObject,
>(
    o: T,
) => DomainObjectDetails;

type DomainRefDataObjects = PickByValue<
    DomainObject,
    {
        ref: { id: number | string };
        data: { name?: string; id?: string };
    }
>;
const defaultGetDomainObjectDetails: GetDomainObjectDetails<ValuesType<DomainRefDataObjects>> = (
    o,
) => ({
    id: o.ref.id,
    label:
        ('name' in o.data ? o.data.name : undefined) ??
        ('id' in o.data ? String(o.data.id ?? '') : undefined) ??
        '',
    source: o,
});

type DomainNoRefDataObjects = Omit<DomainObject, keyof DomainRefDataObjects>;
const GET_DOMAIN_OBJECTS_DETAILS: {
    [N in keyof DomainNoRefDataObjects]-?: GetDomainObjectDetails<DomainNoRefDataObjects[N]>;
} = {
    /* eslint-disable @typescript-eslint/naming-convention */
    currency: (o) => ({ id: o.ref.symbolic_code, label: o.data.name, source: o }),
    payment_method: (o) => ({
        id: inlineJson(o.ref.id, Infinity),
        label: o.data.name,
        source: o,
    }),
    globals: (o) => ({ id: inlineJson(o.ref), label: inlineJson(o.data), source: o }),
    identity_provider: (o) => ({ id: o.ref.id, label: inlineJson(o.data), source: o }),
    dummy_link: (o) => ({ id: o.ref.id, label: o.data.link.id, source: o }),
    limit_config: (o) => ({ id: o.ref.id, label: o.data.description, source: o }),
    /* eslint-enable @typescript-eslint/naming-convention */
};

export function getDomainObjectValueDetailsFn(key: keyof DomainObject): GetDomainObjectDetails {
    return GET_DOMAIN_OBJECTS_DETAILS[key] ?? defaultGetDomainObjectDetails;
}

export function getDomainObjectDetails(o: DomainObject): DomainObjectDetails {
    return getDomainObjectValueDetailsFn(getUnionKey(o))(getUnionValue(o));
}
