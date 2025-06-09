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
            resObj[name].data.options = cloneDeep(srcObj[name].data.options);
            return resObj;
        }
        case 'provider': {
            if (isNil(srcObj[name].data.proxy.additional)) {
                return newObj;
            }
            const resObj = cloneDeep(newObj);
            resObj[name].data.proxy.additional = cloneDeep(srcObj[name].data.proxy.additional);
            return resObj;
        }
        default:
            return newObj;
    }
}
