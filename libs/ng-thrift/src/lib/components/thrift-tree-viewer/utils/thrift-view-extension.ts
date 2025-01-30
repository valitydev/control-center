import { Router } from '@angular/router';
import { Color } from '@vality/matez';
import { Observable, combineLatest, of, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';

import { ThriftData } from '../../../models';

export interface ThriftViewExtensionResult {
    key?: string;
    value?: unknown;
    hidden?: boolean;
    tooltip?: unknown;
    link?: Parameters<Router['navigate']>;
    click?: () => void;
    color?: Color;
    tag?: boolean;
}

export type ThriftViewExtension = {
    determinant: (data: ThriftData, value: unknown) => Observable<boolean>;
    extension: (
        data: ThriftData,
        value: unknown,
        viewValue: unknown,
    ) => Observable<ThriftViewExtensionResult>;
};

export function getFirstDeterminedThriftViewExtensionResult(
    sourceExtensions: ThriftViewExtension[],
    data: ThriftData,
    value: unknown,
    viewValue: unknown,
): Observable<ThriftViewExtensionResult> {
    return sourceExtensions?.length
        ? combineLatest(sourceExtensions.map(({ determinant }) => determinant(data, value))).pipe(
              map((determined) => sourceExtensions.find((_, idx) => determined[idx])),
              switchMap((extension) => extension?.extension(data, value, viewValue) ?? of(null)),
          )
        : of(null);
}
