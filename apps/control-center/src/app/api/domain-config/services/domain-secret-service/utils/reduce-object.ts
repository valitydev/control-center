import { DomainObject } from '@vality/domain-proto/domain';
import { getUnionKey } from '@vality/ng-thrift';
import cloneDeep from 'lodash-es/cloneDeep';
import isNil from 'lodash-es/isNil';

export function reduceObject(obj: DomainObject): DomainObject {
    const name = getUnionKey(obj);
    switch (name) {
        case 'proxy':
        case 'terminal': {
            if (isNil(obj[name].data.options)) {
                return obj;
            }
            const result = cloneDeep(obj);
            delete result[name].data.options;
            return result;
        }
        default:
            return obj;
    }
}
