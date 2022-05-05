import { Component, Input, OnChanges } from '@angular/core';
import { Claim, ModificationUnit } from '@vality/domain-proto/lib/claim_management';
import { Category } from '@vality/dominant-cache-proto';
import { combineLatest, defer, of, ReplaySubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { DominantCacheService } from '@cc/app/api/dominant-cache';
import { ComponentChanges } from '@cc/app/shared';
import { NotificationService } from '@cc/app/shared/services/notification';
import { getUnionKey } from '@cc/utils';

@Component({
    selector: 'cc-shop-modification-timeline-item',
    templateUrl: './shop-modification-timeline-item.component.html',
})
export class ShopModificationTimelineItemComponent implements OnChanges {
    @Input() modificationUnit: ModificationUnit;
    @Input() claim: Claim;

    extended$ = combineLatest([
        defer(() => this.modificationUnit$),
        this.dominantCacheService.GetCategories().pipe(
            catchError((err) => {
                this.notificationService.error('Categories were not loaded');
                console.error(err);
                return of([] as Category[]);
            })
        ),
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

    constructor(
        private dominantCacheService: DominantCacheService,
        private notificationService: NotificationService
    ) {}

    ngOnChanges({ modificationUnit }: ComponentChanges<ShopModificationTimelineItemComponent>) {
        if (modificationUnit) {
            this.modificationUnit$.next(modificationUnit.currentValue);
        }
    }
}
