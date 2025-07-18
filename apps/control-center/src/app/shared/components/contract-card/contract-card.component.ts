import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, inject } from '@angular/core';
import { PartyManagement } from '@vality/domain-proto/payment_processing';
import { ComponentChanges, progressTo } from '@vality/matez';
import { BehaviorSubject, ReplaySubject, combineLatest, defer } from 'rxjs';
import { shareReplay, switchMap } from 'rxjs/operators';

import { CardComponent } from '../sidenav-info/components/card/card.component';
import { DomainThriftViewerComponent } from '../thrift-api-crud';

@Component({
    selector: 'cc-contract-card',
    imports: [CommonModule, CardComponent, DomainThriftViewerComponent],
    templateUrl: './contract-card.component.html',
})
export class ContractCardComponent implements OnChanges {
    private partyManagementService = inject(PartyManagement);
    @Input() partyId: string;
    @Input() id: string;

    progress$ = new BehaviorSubject(0);
    contract$ = combineLatest([defer(() => this.partyId$), defer(() => this.id$)]).pipe(
        switchMap(([partyID, id]) =>
            this.partyManagementService.GetContract(partyID, id).pipe(progressTo(this.progress$)),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    private id$ = new ReplaySubject<string>(1);
    private partyId$ = new ReplaySubject<string>(1);

    ngOnChanges(changes: ComponentChanges<ContractCardComponent>) {
        if (changes.id) {
            this.id$.next(this.id);
        }
        if (changes.partyId) {
            this.partyId$.next(this.partyId);
        }
    }
}
