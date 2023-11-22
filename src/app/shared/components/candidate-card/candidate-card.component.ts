import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { TerminalRef, RoutingRulesetRef } from '@vality/domain-proto/domain';
import { ComponentChanges } from '@vality/ng-core';
import { ReplaySubject, switchMap, defer } from 'rxjs';
import { shareReplay, map } from 'rxjs/operators';

import { DomainStoreService } from '../../../api/domain-config';
import { CardComponent } from '../sidenav-info/components/card/card.component';
import { DomainThriftViewerComponent } from '../thrift-api-crud';

@Component({
    selector: 'cc-candidate-card',
    standalone: true,
    imports: [CommonModule, CardComponent, DomainThriftViewerComponent],
    templateUrl: './candidate-card.component.html',
})
export class CandidateCardComponent implements OnChanges {
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

    constructor(private domainStoreService: DomainStoreService) {}

    ngOnChanges(changes: ComponentChanges<CandidateCardComponent>) {
        if (changes.ref) {
            this.ref$.next(this.ref);
        }
        if (changes.idx) {
            this.idx$.next(this.idx);
        }
    }
}
