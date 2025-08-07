import { ThriftData } from '../thrift-data';

export function getAliases(data: ThriftData): ThriftData[] {
    let alias: ThriftData | undefined = data?.parent;
    const path: ThriftData[] = [];
    while (alias && alias.objectType === 'typedef' && alias.parent) {
        path.push(alias);
        alias = alias?.parent;
    }
    return path;
}
