import { Reference } from '@vality/domain-proto/domain';
import { inlineJson } from '@vality/matez';
import { getUnionKey, getUnionValue } from '@vality/ng-thrift';
import startCase from 'lodash-es/startCase';
import { PickByValue, ValuesType } from 'utility-types';

export type ReferenceId = number | string | null;

type IdReferences = PickByValue<Reference, { id: number | string }>;
type NoIdReferences = Omit<Reference, keyof IdReferences>;

type GetReferenceId<TRef extends ValuesType<Reference> = ValuesType<Reference>> = <T extends TRef>(
    o: T,
) => ReferenceId;

const defaultGetReferenceId: GetReferenceId<ValuesType<IdReferences>> = (ref) => ref.id;

const MAP_REFERENCE_TO_ID: {
    [N in keyof NoIdReferences]-?: GetReferenceId<NoIdReferences[N]>;
} = {
    currency: (ref) => ref.symbolic_code,
    payment_method: (ref) => {
        const type = getUnionKey(ref.id);
        const details = ` (${startCase(type)})`;
        switch (type) {
            case 'payment_terminal':
                return ref.id.payment_terminal.id + details;
            case 'digital_wallet':
                return ref.id.digital_wallet.id + details;
            case 'generic':
                return `${ref.id.generic.payment_service.id} (Payment Service)`;
            case 'mobile':
                return ref.id.mobile.id + details;
            case 'crypto_currency':
                return ref.id.crypto_currency.id + details;
            case 'bank_card':
                return (
                    [
                        ref.id.bank_card.payment_system?.id,
                        ref.id.bank_card.payment_token?.id
                            ? `(${ref.id.bank_card.payment_token?.id})`
                            : null,
                        ref.id.bank_card.tokenization_method === 0 ? '(DPAN)' : null,
                        ref.id.bank_card.is_cvv_empty ? '(No CVV)' : null,
                    ]
                        .filter(Boolean)
                        .join(' ') + details
                );
            default:
                return inlineJson(ref.id, Infinity, true);
        }
    },
    globals: () => 'Globals',
};

export function getReferenceId(ref?: Reference): ReferenceId {
    if (!ref || !getUnionValue(ref)) {
        return null;
    }
    const getDomainObjectValueDetailsFn =
        MAP_REFERENCE_TO_ID[getUnionKey(ref)] ?? defaultGetReferenceId;
    return getDomainObjectValueDetailsFn(getUnionValue(ref));
}
