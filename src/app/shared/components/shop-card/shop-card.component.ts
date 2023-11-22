import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { ComponentChanges } from '@vality/ng-core';
import { ReplaySubject, defer, combineLatest } from 'rxjs';
import { switchMap, map, shareReplay } from 'rxjs/operators';

import { PartiesStoreService } from '../../../api/payment-processing';
import { CardComponent } from '../sidenav-info/components/card/card.component';
import { DomainThriftViewerComponent } from '../thrift-api-crud';

@Component({
    selector: 'cc-shop-card',
    standalone: true,
    imports: [CommonModule, CardComponent, DomainThriftViewerComponent],
    templateUrl: './shop-card.component.html',
})
export class ShopCardComponent implements OnChanges {
    @Input() partyId: string;
    @Input() id: string;

    progress$ = this.partiesStoreService.progress$;
    shop$ = defer(() => this.partyId$).pipe(
        switchMap((partyID) => combineLatest([this.partiesStoreService.get(partyID), this.id$])),
        map(([party, id]) => party.shops.get(id)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    private id$ = new ReplaySubject<string>(1);
    private partyId$ = new ReplaySubject<string>(1);

    constructor(private partiesStoreService: PartiesStoreService) {
        this.progress$.subscribe(console.log);
    }

    ngOnChanges(changes: ComponentChanges<ShopCardComponent>) {
        if (changes.id) {
            this.id$.next(this.id);
        }
        if (changes.partyId) {
            this.partyId$.next(this.partyId);
        }
    }
}
