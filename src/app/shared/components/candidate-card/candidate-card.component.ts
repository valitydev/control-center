import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, inject } from '@angular/core';
import { RoutingRulesetRef, TerminalRef } from '@vality/domain-proto/domain';
import { ComponentChanges } from '@vality/matez';
import { ReplaySubject, defer, switchMap } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { CardComponent } from '../sidenav-info/components/card/card.component';
import { DomainThriftViewerComponent } from '../thrift-api-crud';

import { RoutingRulesStoreService } from '~/api/domain-config';

@Component({
    selector: 'cc-candidate-card',
    imports: [CommonModule, CardComponent, DomainThriftViewerComponent],
    templateUrl: './candidate-card.component.html',
})
export class CandidateCardComponent implements OnChanges {
    private routingRulesStoreService = inject(RoutingRulesStoreService);
    @Input() idx: number;
    @Input() ref: RoutingRulesetRef;

    progress$ = this.routingRulesStoreService.isLoading$;
    candidate$ = defer(() => this.ref$).pipe(
        switchMap((ref) => this.routingRulesStoreService.get(ref)),
        switchMap((s) => this.idx$.pipe(map((idx) => s.data.decisions.candidates[idx]))),
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
