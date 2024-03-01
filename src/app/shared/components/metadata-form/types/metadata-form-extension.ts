import { TemplateRef } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { Observable, combineLatest, switchMap, of } from 'rxjs';
import { map } from 'rxjs/operators';

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
    type?: 'datetime';
    converter?: Converter;
    hidden?: boolean;
    template?: TemplateRef<unknown>;
}

export interface MetadataFormExtensionOption {
    value: unknown;
    label?: string;
    details?: string | object;
    color?: ThemePalette;
}

export function getExtensionsResult(
    sourceExtensions: MetadataFormExtension[],
    data: MetadataFormData,
): Observable<MetadataFormExtensionResult> {
    return sourceExtensions?.length
        ? combineLatest(sourceExtensions.map(({ determinant }) => determinant(data))).pipe(
              map((determined) => sourceExtensions.filter((_, idx) => determined[idx])),
              switchMap((extensions) => {
                  if (!extensions?.length) {
                      return of(null);
                  }
                  return combineLatest(extensions.map((e) => e.extension(data))).pipe(
                      map((results) => Object.assign({}, ...results)),
                  );
              }),
          )
        : of(null);
}
