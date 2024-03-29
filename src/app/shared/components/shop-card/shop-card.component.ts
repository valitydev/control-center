import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { PartyID, ShopID } from '@vality/domain-proto/internal/domain';
import { combineLatest } from 'rxjs';
import { switchMap, shareReplay } from 'rxjs/operators';

import { PartiesStoreService } from '../../../api/payment-processing';
import { CardComponent } from '../sidenav-info/components/card/card.component';
import { DomainThriftViewerComponent, MagistaThriftViewerComponent } from '../thrift-api-crud';
import { ThriftViewerModule } from '../thrift-viewer';

@Component({
    selector: 'cc-shop-card',
    standalone: true,
    imports: [
        CommonModule,
        CardComponent,
        DomainThriftViewerComponent,
        MatCard,
        MatCardContent,
        ThriftViewerModule,
        MatDivider,
        MagistaThriftViewerComponent,
        MatTabGroup,
        MatTab,
    ],
    templateUrl: './shop-card.component.html',
})
export class ShopCardComponent {
    partyId = input.required<PartyID>();
    id = input.required<ShopID>();

    progress$ = this.partiesStoreService.progress$;
    shop$ = combineLatest([toObservable(this.partyId), toObservable(this.id)]).pipe(
        switchMap(([partyId, id]) => this.partiesStoreService.getShop(id, partyId)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    contractor$ = combineLatest([toObservable(this.partyId), toObservable(this.id)]).pipe(
        switchMap(([partyId, id]) => this.partiesStoreService.getContractor(id, partyId)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    contract$ = combineLatest([toObservable(this.partyId), toObservable(this.id)]).pipe(
        switchMap(([partyId, id]) => this.partiesStoreService.getContract(id, partyId)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    constructor(private partiesStoreService: PartiesStoreService) {}
}
