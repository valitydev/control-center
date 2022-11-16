import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import { CategoryRef } from '@vality/domain-proto';
import { Timestamp } from '@vality/domain-proto/lib/base';
import { of, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DominantCacheService } from '@cc/app/api/dominant-cache';
import { MetadataViewExtension } from '@cc/app/shared/components/json-viewer';
import { isTypeWithAliases } from '@cc/app/shared/components/metadata-form';

@Injectable({
    providedIn: 'root',
})
export class DomainMetadataViewExtensionsService {
    extensions$: Observable<MetadataViewExtension[]> = of([
        {
            determinant: (data) => of(isTypeWithAliases(data, 'CategoryRef', 'domain')),
            extension: (data, value: CategoryRef) =>
                this.dominantCacheService.GetCategories().pipe(
                    map((categories) => categories.find((c) => c.ref === String(value.id))),
                    map((category) => ({ value: category.name, tooltip: category }))
                ),
        },
        {
            determinant: (data) => of(isTypeWithAliases(data, 'Timestamp', 'base')),
            extension: (data, value: Timestamp) =>
                of({ value: formatDate(value, 'dd.MM.yyyy HH:mm:ss', 'en') }),
        },
    ]);

    constructor(private dominantCacheService: DominantCacheService) {}
}
