import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { Claim, ModificationUnit } from '@vality/domain-proto/claim_management';
import { ComponentChanges } from '@vality/matez';
import { ReplaySubject } from 'rxjs';

@Component({
    selector: 'cc-shop-modification-timeline-item',
    templateUrl: './shop-modification-timeline-item.component.html',
    standalone: false
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
