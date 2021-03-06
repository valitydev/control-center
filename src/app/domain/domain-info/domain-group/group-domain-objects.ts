import { Domain } from '@vality/domain-proto/lib/domain';
import { Field } from '@vality/thrift-ts';

import { clearNullFields } from '@cc/utils/thrift-utils';

import { DomainGroup } from './domain-group';

function getTypeDef(domainObjDef: Field[]) {
    return domainObjDef.reduce(
        (acc, { name, type }) => ({
            ...acc,
            [name]: type,
        }),
        {}
    );
}

function getDomainObjType(obj: any, domainObjDef: Field[]): string | 'undef' {
    const typeDef = getTypeDef(domainObjDef);
    const fieldName = Object.keys(obj)[0];
    const type = typeDef[fieldName];
    return type ? type : 'undef';
}

function getDomainObjVal(obj: any): any {
    return Object.values(obj)[0];
}

function groupResult(result: any, type: string | 'undef', val: any): any {
    if (type === 'undef') {
        return { undef: null };
    }
    return result[type] ? { [type]: result[type].concat(val) } : { [type]: [val] };
}

function groupByType(domain: Domain, domainObjDef: Field[]) {
    let result = {};
    for (const [ref, domainObject] of domain) {
        const cleared = clearNullFields(domainObject);
        const type = getDomainObjType(cleared, domainObjDef);
        const val = {
            ref,
            object: getDomainObjVal(cleared),
        };
        result = {
            ...result,
            ...groupResult(result, type, val),
        };
    }
    return result;
}

function sortByName(a: DomainGroup, b: DomainGroup): number {
    if (a.name < b.name) {
        return -1;
    }
    if (a.name > b.name) {
        return 1;
    }
    return 0;
}

export function group(domain: Domain, domainObjDef: Field[]): DomainGroup[] {
    return Object.entries(groupByType(domain, domainObjDef))
        .reduce((acc, [name, pairs]) => acc.concat({ name, pairs }), [])
        .sort(sortByName);
}
