import { ThemePalette } from '@angular/material/core';
import { Observable, combineLatest, switchMap, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { MetadataFormData } from './metadata-form-data';

export type MetadataFormExtension = {
    determinant: (data: MetadataFormData) => Observable<boolean>;
    extension: (data: MetadataFormData) => Observable<MetadataFormExtensionResult>;
};

export interface Converter<O = unknown, I = O> {
    outputToInternal: (outputValue: O) => I;
    internalToOutput: (inputValue: I) => O;
}

export interface MetadataFormExtensionResult {
    options?: MetadataFormExtensionOption[];
    generate?: () => Observable<unknown>;
    isIdentifier?: boolean;
    label?: string;
    type?: 'datetime' | 'cash';
    converter?: Converter;
}

export interface MetadataFormExtensionOption {
    value: unknown;
    label?: string;
    details?: string | object;
    color?: ThemePalette;
}

export function getFirstDeterminedExtensionsResult(
    sourceExtensions: MetadataFormExtension[],
    data: MetadataFormData
): Observable<MetadataFormExtensionResult> {
    return combineLatest((sourceExtensions || []).map(({ determinant }) => determinant(data))).pipe(
        map((determined) => (sourceExtensions || []).find((_, idx) => determined[idx])),
        switchMap((extension) => extension?.extension(data) ?? of(null)),
        shareReplay({ refCount: true, bufferSize: 1 })
    );
}
