import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogResponseStatus, DialogService, NotifyLogService } from '@vality/matez';
import { combineLatest, switchMap } from 'rxjs';

import { DomainStoreService } from '../../../api/domain-config';
import { UpdateThriftDialogComponent } from '../../../shared/components/thrift-api-crud';
import { RoutingRulesService } from '../services/routing-rules';
import { CandidateId } from '../services/routing-rules/types/candidate-id';

import { getChangedPredicate } from './get-changed-predicate';

export function changeCandidatesAllowed(candidateIds: CandidateId[], allowedOrToggle?: boolean) {
    const routingRulesService = inject(RoutingRulesService);
    const dr = inject(DestroyRef);
    const domainStoreService = inject(DomainStoreService);
    const log = inject(NotifyLogService);
    const dialogService = inject(DialogService);
    combineLatest(
        candidateIds.map(({ refId, candidateIdx }) =>
            routingRulesService.getCandidate(refId, candidateIdx),
        ),
    )
        .pipe(
            switchMap((candidates) =>
                dialogService
                    .open(UpdateThriftDialogComponent, {
                        title: 'Toggle allowed',
                        prevObject:
                            candidates.length > 1
                                ? candidates.map((candidate, idx) => {
                                      const { refId, candidateIdx } = candidateIds[idx];
                                      return [`#${refId}/${candidateIdx}`, candidate.allowed];
                                  })
                                : candidates[0].allowed,
                        object:
                            candidates.length > 1
                                ? candidates.map((candidate, idx) => {
                                      const { refId, candidateIdx } = candidateIds[idx];
                                      return [
                                          `#${refId}/${candidateIdx}`,
                                          getChangedPredicate(candidate.allowed, allowedOrToggle)
                                              .toggled,
                                      ];
                                  })
                                : getChangedPredicate(candidates[0].allowed, allowedOrToggle)
                                      .toggled,
                        action: () =>
                            routingRulesService.updateRules(
                                candidates.map((candidate, idx) => ({
                                    refId: candidateIds[idx].refId,
                                    candidateIdx: candidateIds[idx].candidateIdx,
                                    newCandidate: {
                                        ...candidate,
                                        allowed: getChangedPredicate(
                                            candidate.allowed,
                                            allowedOrToggle,
                                        ).toggled,
                                    },
                                })),
                            ),
                    })
                    .afterClosed(),
            ),
            takeUntilDestroyed(dr),
        )
        .subscribe((res) => {
            if (res.status === DialogResponseStatus.Success) {
                domainStoreService.forceReload();
                log.successOperation('update', 'Allowed');
            }
        });
}
