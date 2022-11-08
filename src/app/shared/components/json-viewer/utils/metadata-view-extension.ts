import { Observable, combineLatest, switchMap, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { MetadataFormData } from '../../metadata-form';

export interface MetadataViewExtensionResult {
    key?: string;
    value: string;
}

export type MetadataViewExtension = {
    determinant: (data: MetadataFormData, value: any) => Observable<boolean>;
    extension: (data: MetadataFormData, value: any) => Observable<MetadataViewExtensionResult>;
};

export function getFirstDeterminedExtensionsResult(
    sourceExtensions: MetadataViewExtension[],
    data: MetadataFormData,
    value: any
): Observable<MetadataViewExtensionResult> {
    return combineLatest(
        (sourceExtensions || []).map(({ determinant }) => determinant(data, value))
    ).pipe(
        map((determined) => (sourceExtensions || []).find((_, idx) => determined[idx])),
        switchMap((extension) => extension?.extension(data, value) ?? of(null)),
        shareReplay({ refCount: true, bufferSize: 1 })
    );
}
