import { uniq } from 'lodash-es';
import { combineLatest, switchMap, take } from 'rxjs';

import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { RoutingCandidate } from '@vality/domain-proto/domain';
import { DialogResponseStatus, DialogService, NotifyLogService } from '@vality/matez';

import { RoutingRulesStoreService } from '~/api/domain-config';

import { UpdateThriftDialogComponent } from '../../../../shared/components/thrift-api-crud';
import { RoutingRulesService } from '../services/routing-rules';
import { CandidateId } from '../services/routing-rules/types/candidate-id';
import { getUpdateRulesCandidates } from '../services/routing-rules/utils/get-update-rules-candidates';

import { getChangedPredicate } from './get-changed-predicate';

function getCandidateIdLabel({ refId, candidateIdx }: CandidateId) {
    return `#${refId}/${candidateIdx}`;
}

export function changeCandidatesAllowed(candidateIds: CandidateId[], allowedOrToggle?: boolean) {
    const routingRulesService = inject(RoutingRulesService);
    const dr = inject(DestroyRef);
    const routingRulesStoreService = inject(RoutingRulesStoreService);
    const log = inject(NotifyLogService);
    const dialogService = inject(DialogService);

    combineLatest([
        combineLatest(
            candidateIds.map(({ refId, candidateIdx }) =>
                routingRulesService.getCandidate(refId, candidateIdx),
            ),
        ),
        combineLatest(
            uniq(candidateIds.map((c) => c.refId)).map((refId) =>
                routingRulesService.getRuleset(refId).pipe(take(1)),
            ),
        ),
    ])
        .pipe(
            switchMap(([candidates, rulesets]) => {
                const candidatesForUpdate: (CandidateId & { newCandidate: RoutingCandidate })[] =
                    candidates.map((candidate, idx) => ({
                        refId: candidateIds[idx].refId,
                        candidateIdx: candidateIds[idx].candidateIdx,
                        newCandidate: {
                            ...candidate,
                            allowed: getChangedPredicate(candidate.allowed, allowedOrToggle),
                        },
                    }));
                const reviewObjects = getUpdateRulesCandidates(rulesets, candidatesForUpdate);
                return dialogService
                    .open(UpdateThriftDialogComponent, {
                        title: 'Toggle allowed',
                        prevObject:
                            candidates.length > 1
                                ? candidates.map((candidate, idx) => [
                                      getCandidateIdLabel(candidateIds[idx]),
                                      candidate.allowed,
                                  ])
                                : candidates[0].allowed,
                        object:
                            candidates.length > 1
                                ? candidates.map((candidate, idx) => [
                                      getCandidateIdLabel(candidateIds[idx]),
                                      getChangedPredicate(candidate.allowed, allowedOrToggle),
                                  ])
                                : getChangedPredicate(candidates[0].allowed, allowedOrToggle),
                        prevReviewObject:
                            candidates.length > 1 ? rulesets.map((r) => r) : undefined,
                        reviewObject:
                            candidates.length > 1
                                ? reviewObjects.map((r) => r.object.routing_rules)
                                : undefined,
                        action: () => routingRulesService.updateRules(candidatesForUpdate),
                    })
                    .afterClosed();
            }),
            takeUntilDestroyed(dr),
        )
        .subscribe((res) => {
            if (res.status === DialogResponseStatus.Success) {
                routingRulesStoreService.reload();
                log.successOperation('update', 'Allowed');
            }
        });
}
