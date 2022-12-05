import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import { CategoryRef, CriterionRef } from '@vality/domain-proto';
import { Timestamp } from '@vality/domain-proto/lib/base';
import { of, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DomainStoreService } from '@cc/app/api/deprecated-damsel';
import { DominantCacheService } from '@cc/app/api/dominant-cache';
import {
    MetadataViewExtension,
    MetadataViewExtensionResult,
} from '@cc/app/shared/components/json-viewer';
import { isTypeWithAliases } from '@cc/app/shared/components/metadata-form';

@Injectable({
    providedIn: 'root',
})
export class DomainMetadataViewExtensionsService {
    extensions$: Observable<MetadataViewExtension[]> = of([
        {
            determinant: (data) => of(isTypeWithAliases(data, 'CategoryRef', 'domain')),
            extension: (_, value: CategoryRef) =>
                this.domainStoreService.getObjects('category').pipe(
                    map((categories) => categories.find((c) => c.ref.id === value.id)),
                    map((category) => ({
                        value: category.data.name,
                        tooltip: `#${category.ref.id}`,
                        link: [
                            ['/domain'],
                            {
                                queryParams: {
                                    ref: JSON.stringify({ category: category.ref }),
                                },
                            },
                        ],
                    }))
                ),
        },
        {
            determinant: (data) => of(isTypeWithAliases(data, 'CriterionRef', 'domain')),
            extension: (_, value: CriterionRef) =>
                this.domainStoreService.getObjects('criterion').pipe(
                    map((criteries) => criteries.find((c) => c.ref.id === value.id)),
                    map(
                        (critery): MetadataViewExtensionResult => ({
                            value: critery.data.name,
                            tooltip: `#${critery.ref.id}`,
                            link: [
                                ['/domain'],
                                {
                                    queryParams: {
                                        ref: JSON.stringify({ criterion: critery.ref }),
                                    },
                                },
                            ],
                        })
                    )
                ),
        },
        {
            determinant: (data) => of(isTypeWithAliases(data, 'Timestamp', 'base')),
            extension: (data, value: Timestamp) =>
                of({ value: formatDate(value, 'dd.MM.yyyy HH:mm:ss', 'en') }),
        },
    ]);

    constructor(
        private dominantCacheService: DominantCacheService,
        private domainStoreService: DomainStoreService
    ) {}
}
