import { Router } from '@angular/router';
import { Color } from '@vality/ng-core';
import { Observable, combineLatest, switchMap, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { MetadataFormData } from '../../metadata-form';

export interface MetadataViewExtensionResult {
    key?: string;
    value?: string;
    hidden?: boolean;
    tooltip?: unknown;
    link?: Parameters<Router['navigate']>;
    click?: () => void;
    color?: Color;
    tag?: boolean;
}

export type MetadataViewExtension = {
    determinant: (data: MetadataFormData, value: unknown) => Observable<boolean>;
    extension: (
        data: MetadataFormData,
        value: unknown,
        viewValue: unknown,
    ) => Observable<MetadataViewExtensionResult>;
};

export function getFirstDeterminedExtensionsResult(
    sourceExtensions: MetadataViewExtension[],
    data: MetadataFormData,
    value: unknown,
    viewValue: unknown,
): Observable<MetadataViewExtensionResult> {
    return sourceExtensions?.length
        ? combineLatest(sourceExtensions.map(({ determinant }) => determinant(data, value))).pipe(
              map((determined) => sourceExtensions.find((_, idx) => determined[idx])),
              switchMap((extension) => extension?.extension(data, value, viewValue) ?? of(null)),
          )
        : of(null);
}
