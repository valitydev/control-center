import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { Claim, ModificationUnit } from '@vality/domain-proto/lib/claim_management';
import { ReplaySubject } from 'rxjs';

import { ComponentChanges } from '@cc/app/shared';

@Component({
    selector: 'cc-shop-modification-timeline-item',
    templateUrl: './shop-modification-timeline-item.component.html',
})
export class ShopModificationTimelineItemComponent implements OnChanges {
    @Input() modificationUnit: ModificationUnit;
    @Input() claim: Claim;
    @Output() claimChanged = new EventEmitter<void>();

    private modificationUnit$ = new ReplaySubject<ModificationUnit>(1);

    ngOnChanges({ modificationUnit }: ComponentChanges<ShopModificationTimelineItemComponent>) {
        if (modificationUnit) {
            this.modificationUnit$.next(modificationUnit.currentValue);
        }
    }
}
