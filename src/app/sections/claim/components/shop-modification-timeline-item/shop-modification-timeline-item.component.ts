import { Component, Input, OnChanges } from '@angular/core';
import { ModificationUnit } from '@vality/domain-proto/lib/claim_management';
import { combineLatest, defer, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { DominantCacheService } from '@cc/app/api/dominant-cache';
import { ComponentChanges } from '@cc/app/shared';
import { getUnionKey } from '@cc/utils';

@Component({
    selector: 'cc-shop-modification-timeline-item',
    templateUrl: './shop-modification-timeline-item.component.html',
})
export class ShopModificationTimelineItemComponent implements OnChanges {
    @Input() modificationUnit: ModificationUnit;

    extended$ = combineLatest([
        defer(() => this.modificationUnit$),
        this.dominantCacheService.GetCategories(),
    ]).pipe(
        map(([modificationUnit, categories]) => {
            const modification =
                modificationUnit.modification.party_modification.shop_modification.modification;
            switch (getUnionKey(modification)) {
                case 'creation': {
                    const category = categories.find(
                        (c) => c.ref === String(modification.creation?.category?.id)
                    );
                    return [{ path: ['category', 'id'], value: category?.name }];
                }
                default:
                    return [];
            }
        })
    );

    private modificationUnit$ = new ReplaySubject<ModificationUnit>(1);

    constructor(private dominantCacheService: DominantCacheService) {}

    ngOnChanges({ modificationUnit }: ComponentChanges<ShopModificationTimelineItemComponent>) {
        if (modificationUnit) {
            this.modificationUnit$.next(modificationUnit.currentValue);
        }
    }
}
