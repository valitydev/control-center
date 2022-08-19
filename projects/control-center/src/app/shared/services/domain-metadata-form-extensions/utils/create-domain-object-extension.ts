import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import {
    isTypeWithAliases,
    MetadataFormExtension,
    MetadataFormExtensionOption,
} from '../../../components';

export function createDomainObjectExtension(
    refType: string,
    options: () => Observable<MetadataFormExtensionOption[]>
): MetadataFormExtension {
    return {
        determinant: (data) =>
            of(
                isTypeWithAliases(data?.trueParent, refType, 'domain') &&
                    (isTypeWithAliases(data, 'ObjectID', 'domain') ||
                        // TODO: 'field.name' must be passed as an argument
                        ['id', 'symbolic_code'].includes(data.field?.name))
            ),
        extension: () =>
            options().pipe(
                map((objects) => ({
                    options: objects.sort((a, b) =>
                        typeof a.value === 'number' && typeof b.value === 'number'
                            ? a.value - b.value
                            : 0
                    ),
                    isIdentifier: true,
                }))
            ),
    };
}
