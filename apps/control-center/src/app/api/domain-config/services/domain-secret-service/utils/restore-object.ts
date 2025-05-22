import { DomainObject } from '@vality/domain-proto/domain';
import { getUnionKey } from '@vality/ng-thrift';
import { cloneDeep, isNil } from 'lodash-es';

export function restoreObject(srcObj: DomainObject, newObj: DomainObject): DomainObject {
    const name = getUnionKey(newObj);
    switch (name) {
        case 'proxy':
        case 'terminal': {
            if (isNil(srcObj[name].data.options)) {
                return newObj;
            }
            const resObj = cloneDeep(newObj);
            const options = srcObj[name].data.options;
            resObj[name].data.options = cloneDeep(options);
            return resObj;
        }
        default:
            return newObj;
    }
}
