import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { isTypeWithAliases, MetadataFormExtension } from '@cc/app/shared';

export function createDomainObjectMetadataFormExtension(
    refType: string,
    getObjects: () => Observable<{ ref: { id: number }; data: { name?: string } }[]>
): MetadataFormExtension {
    return {
        determinant: (data) =>
            of(
                isTypeWithAliases(data?.trueParent, refType, 'domain') &&
                    isTypeWithAliases(data, 'ObjectID', 'domain')
            ),
        extension: () =>
            getObjects().pipe(
                map((objects) => ({
                    options: objects
                        .sort((a, b) => a.ref.id - b.ref.id)
                        .map((o) => ({
                            label: `#${o.ref.id}` + (o.data.name ? ` ${o.data.name}` : ''),
                            value: o.ref.id,
                            details: o,
                        })),
                }))
            ),
    };
}
