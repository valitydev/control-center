import { Injectable, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
    DialogService,
    ConfirmDialogComponent,
    DialogResponseStatus,
    NotifyLogService,
} from '@vality/ng-core';
import { Observable, filter } from 'rxjs';
import { map, shareReplay, switchMap, take, withLatestFrom } from 'rxjs/operators';

import { RoutingRulesService as RoutingRulesDamselService } from '../services/routing-rules';

@Injectable()
export class RoutingRulesetService {
    partyID$: Observable<string> = this.route.params.pipe(
        map((r) => r.partyID),
        shareReplay(1),
    );
    partyRulesetRefID$: Observable<number> = this.route.params.pipe(
        map((r) => r.partyRefID),
        map((p) => +p),
        shareReplay(1),
    );
    refID$: Observable<number> = this.route.params.pipe(
        map((r) => r.refID),
        map((p) => +p),
        shareReplay(1),
    );
    ruleset$ = this.refID$.pipe(
        switchMap((refID) => this.routingRulesService.getRuleset(refID)),
        shareReplay(1),
    );

    constructor(
        private routingRulesService: RoutingRulesDamselService,
        private route: ActivatedRoute,
        private log: NotifyLogService,
        private dialog: DialogService,
        private destroyRef: DestroyRef,
    ) {}

    removeRule(candidateIdx: number) {
        this.dialog
            .open(ConfirmDialogComponent)
            .afterClosed()
            .pipe(
                filter((r) => r.status === DialogResponseStatus.Success),
                withLatestFrom(this.refID$),
                take(1),
                switchMap(([, refID]) =>
                    this.routingRulesService.removeShopRule({
                        refID,
                        candidateIdx,
                    }),
                ),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: () => {
                    this.log.successOperation('delete', 'Shop routing candidate');
                },
                error: (err) => {
                    this.log.error(err);
                },
            });
    }
}
