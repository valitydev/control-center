import { DomainObject } from '@vality/domain-proto';
import startCase from 'lodash-es/startCase';

const LABEL_SELECTORS: {
    [N in keyof DomainObject]: (obj: DomainObject[N]) => string;
} = {
    /* eslint-disable @typescript-eslint/naming-convention */
    dummy_link: (o) => o.data?.link?.id,
    identity_provider: (o) => o.ref.id,
    currency: (o) => o.ref.symbolic_code,
    /* eslint-enable @typescript-eslint/naming-convention */
};

export function getObjectLabel(o: DomainObject[keyof DomainObject], objectKey: keyof DomainObject) {
    if (LABEL_SELECTORS[objectKey]) return LABEL_SELECTORS[objectKey](o as never);
    if ('name' in o.data && o.data.name) return o.data.name;
    const id = 'id' in o.ref && typeof o.ref.id !== 'object' ? o.ref.id : '';
    return startCase([...objectKey.split('_'), 'ref', id && `#${id}`].filter(Boolean).join(' '));
}
