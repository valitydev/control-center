import { ThriftData } from '../thrift-data';

export function getAliases(data: ThriftData): ThriftData[] {
    const path: ThriftData[] = [];

    let alias: ThriftData | undefined = data?.parent;
    while (alias && alias.objectType === 'typedef') {
        path.push(alias);
        alias = alias?.parent;
    }

    return path;
}
