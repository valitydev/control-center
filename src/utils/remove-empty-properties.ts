import identity from 'lodash-es/identity';
import pickBy from 'lodash-es/pickBy';

export const removeEmptyProperties = <T extends object>(s: T) => pickBy(s, identity) as Partial<T>;
