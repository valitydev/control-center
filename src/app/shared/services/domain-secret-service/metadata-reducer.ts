import { ThriftAstMetadata } from '@cc/app/api/utils';

const filterDomain = (m: ThriftAstMetadata, exclude: string[]): ThriftAstMetadata => ({
    ...m,
    ast: {
        ...m.ast,
        union: {
            ...m.ast.union,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            DomainObject: m.ast.union.DomainObject.filter(
                ({ type }) => !exclude.includes(type as string)
            ),
        },
    },
});

export const metadataReducer =
    (excludeObjects: string[]) => (acc: ThriftAstMetadata[], curr: ThriftAstMetadata) =>
        curr.name === 'domain' ? [...acc, filterDomain(curr, excludeObjects)] : [...acc, curr];
