import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { Option } from '@vality/matez';
import { ThriftData, ThriftFormExtension, isTypeWithAliases } from '@vality/ng-thrift';

import { createNextId } from '~/utils';

export function isDomainObject(data: ThriftData, refType: string) {
    return (
        isTypeWithAliases(data?.trueParent, refType, 'domain') &&
        (isTypeWithAliases(data, 'ObjectID', 'domain') ||
            // TODO: 'field.name' must be passed as an argument
            ['id', 'symbolic_code'].includes(data.field?.name))
    );
}

export function createDomainObjectExtensions(
    refType: string,
    options: () => Observable<Option[]>,
    determinant?: ThriftFormExtension['determinant'],
): ThriftFormExtension[] {
    return [
        {
            determinant: (data) => {
                const domainObjDeterminantRes = isDomainObject(data, refType);
                return determinant
                    ? determinant(data).pipe(
                          map(
                              (customDeterminantRes) =>
                                  domainObjDeterminantRes || customDeterminantRes,
                          ),
                      )
                    : of(domainObjDeterminantRes);
            },
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
