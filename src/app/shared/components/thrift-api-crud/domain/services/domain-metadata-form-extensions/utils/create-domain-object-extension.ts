import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import {
    ThriftFormExtension,
    ThriftFormExtensionOption,
    isTypeWithAliases,
} from '@vality/ng-thrift';

import { createNextId } from '~/utils';

export function createDomainObjectExtensions(
    refType: string,
    options: () => Observable<ThriftFormExtensionOption[]>,
): ThriftFormExtension[] {
    return [
        {
            determinant: (data) =>
                of(
                    isTypeWithAliases(data?.trueParent, refType, 'domain') &&
                        (isTypeWithAliases(data, 'ObjectID', 'domain') ||
                            // TODO: 'field.name' must be passed as an argument
                            ['id', 'symbolic_code'].includes(data.field?.name)),
                ),
            extension: (data) =>
                options().pipe(
                    map((objects) => ({
                        options: objects.sort((a, b) =>
                            typeof a.value === 'number' && typeof b.value === 'number'
                                ? a.value - b.value
                                : 0,
                        ),
                        isIdentifier: true,
                        generate: isTypeWithAliases(data, 'ObjectID', 'domain')
                            ? () =>
                                  of(
                                      createNextId(
                                          objects.map((o) =>
                                              typeof o.value === 'number' ? o.value : 0,
                                          ),
                                      ),
                                  )
                            : undefined,
                    })),
                ),
        },
    ];
}
