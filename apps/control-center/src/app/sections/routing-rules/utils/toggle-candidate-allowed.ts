import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogResponseStatus, DialogService, NotifyLogService } from '@vality/matez';
import { switchMap } from 'rxjs';

import { DomainStoreService } from '../../../api/domain-config';
import { UpdateThriftDialogComponent } from '../../../shared/components/thrift-api-crud';
import { RoutingRulesService } from '../services/routing-rules';

import { invertPredicate } from './invert-predicate';

export function toggleCandidateAllowed(refId: number, candidateIdx: number) {
    const routingRulesService = inject(RoutingRulesService);
    const dr = inject(DestroyRef);
    const domainStoreService = inject(DomainStoreService);
    const log = inject(NotifyLogService);
    const dialogService = inject(DialogService);
    routingRulesService
        .getCandidate(refId, candidateIdx)
        .pipe(
            switchMap((candidate) => {
                const newAllowed = invertPredicate(candidate.allowed).toggled;
                return dialogService
                    .open(UpdateThriftDialogComponent, {
                        title: 'Toggle allowed',
                        prevObject: candidate.allowed,
                        object: newAllowed,
                        action: () =>
                            routingRulesService.updateRule(refId, candidateIdx, {
                                ...candidate,
                                allowed: newAllowed,
                            }),
                    })
                    .afterClosed();
            }),
            takeUntilDestroyed(dr),
        )
        .subscribe((res) => {
            if (res.status === DialogResponseStatus.Success) {
                domainStoreService.forceReload();
                log.successOperation('update', 'Allowed');
            }
        });
}
