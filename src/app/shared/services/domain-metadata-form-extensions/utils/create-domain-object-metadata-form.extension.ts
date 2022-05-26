import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import {
    isTypeWithAliases,
    MetadataFormExtension,
    MetadataFormExtensionOption,
} from '../../../components';

export function createDomainObjectMetadataFormExtension(
    refType: string,
    options: () => Observable<MetadataFormExtensionOption[]>
): MetadataFormExtension {
    return {
        determinant: (data) =>
            of(
                isTypeWithAliases(data?.trueParent, refType, 'domain') &&
                    isTypeWithAliases(data, 'ObjectID', 'domain')
            ),
        extension: () =>
            options().pipe(
                map((objects) => ({
                    options: objects
                        .sort((a, b) =>
                            typeof a.value === 'number' && typeof b.value === 'number'
                                ? a.value - b.value
                                : 0
                        )
                        .map((o) => ({
                            details: o,
                            ...o,
                        })),
                    isIdentifier: true,
                }))
            ),
    };
}
