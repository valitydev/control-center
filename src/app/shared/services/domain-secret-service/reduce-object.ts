import { DomainObject } from '@vality/domain-proto';
import cloneDeep from 'lodash-es/cloneDeep';
import isNil from 'lodash-es/isNil';

export const reduceObject = (objectName: string, o: DomainObject): DomainObject => {
    if (isNil(o[objectName].data.options)) {
        return o;
    }
    const result = cloneDeep(o);
    delete result[objectName].data.options;
    return result;
};
