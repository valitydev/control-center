import isNil from 'lodash-es/isNil';
import startCase from 'lodash-es/startCase';
import { Overwrite, PickByValue, ValuesType } from 'utility-types';

import { DomainObject } from '@vality/domain-proto/domain';
import { LimitedVersionedObject } from '@vality/domain-proto/domain_config_v2';
import { inlineJson } from '@vality/matez';
import { getUnionKey, getUnionValue } from '@vality/ng-thrift';

import { getReferenceId } from './get-reference-id';

export interface DomainObjectDetails {
    id: number | string;
    label: string;
    description?: string;
    idDescription?: string;
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
    currency: (o) => ({
        id: o.ref.symbolic_code,
        label: o.ref.symbolic_code,
        description: o.data.name,
    }),
    payment_method: (o) => {
        let id: string;
        const type = ` (${startCase(getUnionKey(o.ref.id))})`;
        switch (getUnionKey(o.ref.id)) {
            case 'payment_terminal':
                id = o.ref.id.payment_terminal.id + type;
                break;
            case 'digital_wallet':
                id = o.ref.id.digital_wallet.id + type;
                break;
            case 'generic':
                id = `${o.ref.id.generic.payment_service.id} (Payment Service)`;
                break;
            case 'mobile':
                id = o.ref.id.mobile.id + type;
                break;
            case 'crypto_currency':
                id = o.ref.id.crypto_currency.id + type;
                break;
            case 'bank_card':
                id =
                    [
                        o.ref.id.bank_card.payment_system?.id,
                        o.ref.id.bank_card.payment_token?.id
                            ? `(${o.ref.id.bank_card.payment_token?.id})`
                            : null,
                        o.ref.id.bank_card.tokenization_method === 0 ? '(DPAN)' : null,
                        o.ref.id.bank_card.is_cvv_empty ? '(No CVV)' : null,
                    ]
                        .filter(Boolean)
                        .join(' ') + type;
                break;
            default:
                id = inlineJson(o.ref.id, Infinity, true);
        }
        return {
            id,
            label: o.data.name,
            description: o.data.description,
        };
    },
    globals: (o) => ({
        id: 'Global',
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
};

export function getDomainObjectValueDetailsFn(key: keyof DomainObject): GetDomainObjectDetails {
    return GET_DOMAIN_OBJECTS_DETAILS[key] ?? defaultGetDomainObjectDetails;
}

function getBasicDomainObjectDetails(
    result: Overwrite<
        Omit<DomainObjectDetails, 'type'>,
        Pick<Partial<DomainObjectDetails>, 'id' | 'label'>
    >,
    type: string,
): DomainObjectDetails {
    return {
        id: result.id,
        label:
            result.label ||
            result.description ||
            `${startCase(type)}${isNil(result.id) ? '' : ' ' + result.id}`,
        description: result.label ? result.description : '',
        idDescription:
            String(result.id) +
            (result.label ? (result.description ? ` (${result.description})` : '') : ''),
        type: startCase(type),
    };
}

export function getDomainObjectDetails(o: DomainObject): DomainObjectDetails {
    if (!o || !getUnionValue(o)?.ref || !getUnionValue(o)?.data) {
        return { id: null, label: '', description: '', type: '' };
    }
    return getBasicDomainObjectDetails(
        getDomainObjectValueDetailsFn(getUnionKey(o))(getUnionValue(o)),
        getUnionKey(o),
    );
}

export function getLimitedDomainObjectDetails(o: LimitedVersionedObject): DomainObjectDetails {
    return getBasicDomainObjectDetails(
        {
            id: getReferenceId(o.ref),
            label: o.name,
            description: o.description,
        },
        getUnionKey(o.ref),
    );
}
