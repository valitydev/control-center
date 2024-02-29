import { DomainObject } from '@vality/domain-proto/domain';
import { inlineJson } from '@vality/ng-core';
import startCase from 'lodash-es/startCase';
import { PickByValue, ValuesType } from 'utility-types';

import { getUnionKey, getUnionValue } from '../../../../../../utils';

export interface DomainObjectDetails {
    id: number | string;
    label: string;
    description?: string;
    type: string;
}

type GetDomainObjectDetails<TObject extends ValuesType<DomainObject> = ValuesType<DomainObject>> = <
    T extends TObject,
>(
    o: T,
) => Partial<Omit<DomainObjectDetails, 'type'>>;

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
        ('name' in o.data ? o.data.name : undefined) ||
        ('id' in o.data ? String(o.data.id ?? undefined) : undefined),
    description: 'description' in o.data ? o.data.description : undefined,
});

type DomainNoRefDataObjects = Omit<DomainObject, keyof DomainRefDataObjects>;
const GET_DOMAIN_OBJECTS_DETAILS: {
    [N in keyof DomainNoRefDataObjects]-?: GetDomainObjectDetails<DomainNoRefDataObjects[N]>;
} = {
    /* eslint-disable @typescript-eslint/naming-convention */
    currency: (o) => ({
        id: o.ref.symbolic_code,
        label: o.ref.symbolic_code,
        description: o.data.name,
    }),
    payment_method: (o) => ({
        id: inlineJson(o.ref.id, Infinity),
        label: o.data.name,
        description: o.data.description,
    }),
    globals: (o) => ({
        id: inlineJson(o.ref),
        label: startCase(getUnionKey(o.data)),
        description: inlineJson(o.data),
    }),
    identity_provider: (o) => ({
        id: o.ref.id,
        label: startCase(getUnionKey(o.data)),
        description: inlineJson(o.data),
    }),
    dummy_link: (o) => ({
        id: o.ref.id,
        label: o.data.link.id,
    }),
    limit_config: (o) => ({
        id: o.ref.id,
        label: o.data.description,
    }),
    /* eslint-enable @typescript-eslint/naming-convention */
};

export function getDomainObjectValueDetailsFn(key: keyof DomainObject): GetDomainObjectDetails {
    return GET_DOMAIN_OBJECTS_DETAILS[key] ?? defaultGetDomainObjectDetails;
}

export function getDomainObjectDetails(o: DomainObject): DomainObjectDetails {
    if (!o || !getUnionValue(o)) {
        return { id: null, label: '', description: '', type: '' };
    }
    const result = getDomainObjectValueDetailsFn(getUnionKey(o))(getUnionValue(o));
    return {
        id: result.id,
        label: result.label || result.description || String(result.id) || startCase(getUnionKey(o)),
        description: result.label ? result.description : '',
        type: startCase(getUnionKey(o)),
    };
}
