import { Observable, combineLatest, map, of, switchMap } from 'rxjs';

import { ThriftData } from '../../../models';

import { ThriftViewExtension } from './thrift-view-extension';
import { ThriftViewExtensionResult } from './thrift-view-extension-result';

export function getFirstDeterminedThriftViewExtensionResult(
    sourceExtensions: ThriftViewExtension[] | undefined,
    data: ThriftData,
    value: unknown,
    viewValue: unknown,
): Observable<ThriftViewExtensionResult | null> {
    return sourceExtensions?.length
        ? combineLatest(sourceExtensions.map(({ determinant }) => determinant(data, value))).pipe(
              map((determined) => sourceExtensions.find((_, idx) => determined[idx])),
              switchMap((extension) => extension?.extension(data, value, viewValue) ?? of(null)),
          )
        : of(null);
}
