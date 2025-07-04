import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, inject } from '@angular/core';
import { RoutingRulesetRef, TerminalRef } from '@vality/domain-proto/domain';
import { ComponentChanges } from '@vality/matez';
import { ReplaySubject, defer, switchMap } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { DomainStoreService } from '../../../api/domain-config';
import { CardComponent } from '../sidenav-info/components/card/card.component';
import { DomainThriftViewerComponent } from '../thrift-api-crud';

@Component({
    selector: 'cc-candidate-card',
    imports: [CommonModule, CardComponent, DomainThriftViewerComponent],
    templateUrl: './candidate-card.component.html',
})
export class CandidateCardComponent implements OnChanges {
    private domainStoreService = inject(DomainStoreService);
    @Input() idx: number;
    @Input() ref: RoutingRulesetRef;

    progress$ = this.domainStoreService.isLoading$;
    candidate$ = defer(() => this.ref$).pipe(
        switchMap((ref) => this.domainStoreService.getObject({ routing_rules: ref })),
        switchMap((s) =>
            this.idx$.pipe(map((idx) => s.routing_rules.data.decisions.candidates[idx])),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    private ref$ = new ReplaySubject<TerminalRef>(1);
    private idx$ = new ReplaySubject<number>(1);

    ngOnChanges(changes: ComponentChanges<CandidateCardComponent>) {
        if (changes.ref) {
            this.ref$.next(this.ref);
        }
        if (changes.idx) {
            this.idx$.next(this.idx);
        }
    }
}
