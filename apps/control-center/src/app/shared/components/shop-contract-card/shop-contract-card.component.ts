import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { ComponentChanges, progressTo } from '@vality/matez';
import { BehaviorSubject, ReplaySubject, combineLatest, defer } from 'rxjs';
import { shareReplay, switchMap } from 'rxjs/operators';

import { PartyManagementService } from '../../../api/payment-processing';
import { CardComponent } from '../sidenav-info/components/card/card.component';
import { DomainThriftViewerComponent } from '../thrift-api-crud';

@Component({
    selector: 'cc-shop-contract-card',
    standalone: true,
    imports: [CommonModule, CardComponent, DomainThriftViewerComponent],
    templateUrl: './shop-contract-card.component.html',
})
export class ShopContractCardComponent implements OnChanges {
    @Input() partyId: string;
    @Input() id: string;

    progress$ = new BehaviorSubject(0);
    contract$ = combineLatest([defer(() => this.partyId$), defer(() => this.id$)]).pipe(
        switchMap(([partyID, id]) =>
            this.partyManagementService
                .GetShopContract(partyID, id)
                .pipe(progressTo(this.progress$)),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    private id$ = new ReplaySubject<string>(1);
    private partyId$ = new ReplaySubject<string>(1);

    constructor(private partyManagementService: PartyManagementService) {}

    ngOnChanges(changes: ComponentChanges<ShopContractCardComponent>) {
        if (changes.id) {
            this.id$.next(this.id);
        }
        if (changes.partyId) {
            this.partyId$.next(this.partyId);
        }
    }
}
