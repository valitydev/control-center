import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { isTypeWithAliases, MetadataFormExtension } from '@cc/app/shared';

export function createDomainObjectMetadataFormExtension(
    refType: string,
    getObjects: () => Observable<{ ref: { id: string | number }; data: { name?: string } }[]>
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
                    options: objects.map((o) => ({
                        label: `#${o.ref.id} ${o.data.name}`,
                        value: o.ref.id,
                        details: o,
                    })),
                }))
            ),
    };
}
