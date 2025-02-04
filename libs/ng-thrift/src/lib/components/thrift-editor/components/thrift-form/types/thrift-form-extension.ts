import { TemplateRef } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { Observable, combineLatest, of, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';

import { ThriftData } from '../../../../../models';

export type ThriftFormExtension = {
    determinant: (data: ThriftData) => Observable<boolean>;
    extension: (data: ThriftData) => Observable<ThriftFormExtensionResult>;
};

export interface Converter<O = unknown, I = O> {
    outputToInternal: (outputValue: O) => I;
    internalToOutput: (inputValue: I) => O;
}

export interface ThriftFormExtensionResult {
    options?: ThriftFormExtensionOption[];
    generate?: () => Observable<unknown>;
    isIdentifier?: boolean;
    label?: string;
    type?: 'datetime';
    converter?: Converter;
    hidden?: boolean;
    template?: TemplateRef<unknown>;
}

export interface ThriftFormExtensionOption {
    value: unknown;
    label?: string;
    details?: string | object;
    color?: ThemePalette;
}

export function getExtensionsResult(
    sourceExtensions: ThriftFormExtension[] = [],
    data: ThriftData,
): Observable<ThriftFormExtensionResult> {
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
