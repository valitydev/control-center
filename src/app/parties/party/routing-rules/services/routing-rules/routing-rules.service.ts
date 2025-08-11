import { Injectable, inject } from '@angular/core';
import {
    PartyConditionDefinition,
    RoutingCandidate,
    RoutingDelegate,
    RoutingRulesObject,
    RoutingRuleset,
} from '@vality/domain-proto/domain';
import { uniq } from 'lodash-es';
import cloneDeep from 'lodash-es/cloneDeep';
import { Observable, combineLatest, concat } from 'rxjs';
import { map, shareReplay, switchMap, take } from 'rxjs/operators';

import { CandidateId } from './types/candidate-id';
import { getDelegate } from './utils/get-delegate';
import { getUpdateRulesCandidates } from './utils/get-update-rules-candidates';

import { RoutingRulesStoreService } from '~/api/domain-config';
import { createNextId } from '~/utils';

@Injectable({
    providedIn: 'root',
})
export class RoutingRulesService {
    private routingRulesStoreService = inject(RoutingRulesStoreService);

    rulesets$: Observable<RoutingRulesObject[]> = this.routingRulesStoreService.routingRules$.pipe(
        map((r) => r.sort((a, b) => a.ref.id - b.ref.id)),
        shareReplay(1),
    );

    nextRefID$ = this.rulesets$.pipe(
        map((rulesets) => rulesets.map(({ ref }) => ref.id)),
        map(createNextId),
    );

    getRuleset(refID: number): Observable<RoutingRulesObject> {
        return this.rulesets$.pipe(map((rulesets) => rulesets.find((r) => r?.ref?.id === refID)));
    }

    getCandidate(refID: number, candidateIdx: number): Observable<RoutingCandidate> {
        return this.getRuleset(refID).pipe(
            take(1),
            map((ruleset) => cloneDeep(ruleset.data.decisions.candidates.at(candidateIdx))),
        );
    }

    addPartyRuleset({
        name,
        mainRulesetRefID,
        partyID,
        description,
        delegateDescription,
    }: {
        name: string;
        mainRulesetRefID: number;
        partyID: string;
        description?: string;
        delegateDescription?: string;
    }) {
        return combineLatest([this.getRuleset(mainRulesetRefID), this.nextRefID$]).pipe(
            take(1),
            switchMap(([mainRuleset, id]) => {
                const ruleset: RoutingRuleset = {
                    name,
                    description,
                    decisions: {
                        delegates: [],
                    },
                };
                const newMainRuleset = this.cloneRulesetAndPushDelegate(mainRuleset, {
                    ruleset: { id },
                    description: delegateDescription,
                    allowed: {
                        condition: {
                            party: {
                                id: partyID,
                            },
                        },
                    },
                });
                return this.routingRulesStoreService.commit([
                    {
                        insert: {
                            object: { routing_rules: ruleset },
                            force_ref: { routing_rules: { id } },
                        },
                    },
                    { update: { object: { routing_rules: newMainRuleset } } },
                ]);
            }),
        );
    }

    addRuleset({
        name,
        definition,
        partyID,
        partyRulesetRefID,
        description,
    }: {
        name: string;
        definition: PartyConditionDefinition;
        partyID: string;
        partyRulesetRefID: number;
        description?: string;
    }) {
        return combineLatest([this.getRuleset(partyRulesetRefID), this.nextRefID$]).pipe(
            take(1),
            switchMap(([partyRuleset, id]) => {
                const ruleset: RoutingRuleset = {
                    name,
                    description,
                    decisions: {
                        candidates: [],
                    },
                };
                const newPartyRuleset = this.cloneRulesetAndPushDelegate(partyRuleset, {
                    ruleset: { id },
                    allowed: {
                        condition: {
                            party: {
                                id: partyID,
                                definition,
                            },
                        },
                    },
                });
                return this.routingRulesStoreService.commit([
                    {
                        insert: {
                            object: { routing_rules: ruleset },
                            force_ref: { routing_rules: { id } },
                        },
                    },
                    {
                        update: { object: { routing_rules: newPartyRuleset } },
                    },
                ]);
            }),
        );
    }

    addRule(refID: number, params: RoutingCandidate) {
        return this.getRuleset(refID).pipe(
            take(1),
            switchMap((ruleset) => {
                const newShopRuleset = this.cloneRulesetAndPushCandidate(ruleset, params);
                return this.routingRulesStoreService.commit([
                    { update: { object: { routing_rules: newShopRuleset } } },
                ]);
            }),
        );
    }

    updateRules(candidates: (CandidateId & { newCandidate: RoutingCandidate })[]) {
        return combineLatest(
            uniq(candidates.map((c) => c.refId)).map((refId) =>
                this.getRuleset(refId).pipe(take(1)),
            ),
        ).pipe(
            switchMap((rulesets) =>
                this.routingRulesStoreService.commit(
                    getUpdateRulesCandidates(rulesets, candidates).map((update) => ({ update })),
                ),
            ),
        );
    }

    attachPartyDelegateRuleset({
        mainRulesetRefID,
        partyID,
        mainDelegateDescription,
        ruleset: { name, description },
    }: {
        mainRulesetRefID: number;
        partyID: string;
        mainDelegateDescription?: string;
        ruleset: { name: string; description?: string };
    }) {
        return combineLatest([this.getRuleset(mainRulesetRefID), this.nextRefID$]).pipe(
            take(1),
            switchMap(([mainRuleset, id]) => {
                const newMainPaymentRoutingRuleset = this.cloneRulesetAndPushDelegate(mainRuleset, {
                    description: mainDelegateDescription,
                    allowed: {
                        condition: {
                            party: { id: partyID },
                        },
                    },
                    ruleset: { id },
                });
                const ruleset: RoutingRulesObject = {
                    ref: { id },
                    data: {
                        name,
                        description,
                        decisions: { delegates: [] },
                    },
                };
                return this.routingRulesStoreService.commit([
                    {
                        insert: {
                            object: { routing_rules: ruleset.data },
                            force_ref: { routing_rules: { id } },
                        },
                    },
                    {
                        update: { object: { routing_rules: newMainPaymentRoutingRuleset } },
                    },
                ]);
            }),
        );
    }

    removeShopRule({ refID, candidateIdx }: { refID: number; candidateIdx: number }) {
        return this.getRuleset(refID).pipe(
            take(1),
            switchMap((shopRuleset) => {
                const newShopRule = cloneDeep(shopRuleset);
                newShopRule.data.decisions.candidates.splice(candidateIdx, 1);
                return this.routingRulesStoreService.commit([
                    { update: { object: { routing_rules: newShopRule } } },
                ]);
            }),
        );
    }

    deleteDelegate({
        mainRulesetRefID,
        delegateIdx,
    }: {
        mainRulesetRefID: number;
        delegateIdx: number;
    }) {
        return this.getRuleset(mainRulesetRefID).pipe(
            take(1),
            switchMap((mainRuleset) => {
                const newMainPaymentRoutingRuleset = cloneDeep(mainRuleset);
                newMainPaymentRoutingRuleset.data.decisions.delegates.splice(delegateIdx, 1);
                return this.routingRulesStoreService.commit([
                    { update: { object: { routing_rules: newMainPaymentRoutingRuleset } } },
                ]);
            }),
        );
    }

    changeMainRuleset({
        previousMainRulesetRefID,
        mainRulesetRefID,
        delegateIdx,
        mainDelegateDescription,
    }: {
        previousMainRulesetRefID: number;
        mainRulesetRefID: number;
        delegateIdx: number;
        mainDelegateDescription?: string;
    }) {
        return combineLatest([
            this.getRuleset(mainRulesetRefID),
            this.getRuleset(previousMainRulesetRefID),
        ]).pipe(
            take(1),
            switchMap(([mainRuleset, previousMainRuleset]) => {
                const newPreviousMainRuleset = cloneDeep(previousMainRuleset);
                const [delegate] = newPreviousMainRuleset.data.decisions.delegates.splice(
                    delegateIdx,
                    1,
                );
                const newMainPaymentRoutingRuleset = cloneDeep(mainRuleset);
                if (!newMainPaymentRoutingRuleset.data.decisions.delegates) {
                    newMainPaymentRoutingRuleset.data.decisions.delegates = [];
                }
                newMainPaymentRoutingRuleset.data.decisions.delegates.push({
                    ...delegate,
                    description: mainDelegateDescription,
                });
                return this.routingRulesStoreService.commit([
                    {
                        update: { object: { routing_rules: newPreviousMainRuleset } },
                    },
                    {
                        update: { object: { routing_rules: newMainPaymentRoutingRuleset } },
                    },
                ]);
            }),
        );
    }

    changeDelegateRuleset({
        mainRulesetRefID,
        delegateIdx,
        newDelegateRulesetRefID,
        description,
    }: {
        mainRulesetRefID: number;
        delegateIdx: number;
        newDelegateRulesetRefID: number;
        description?: string;
    }) {
        return this.getRuleset(mainRulesetRefID).pipe(
            take(1),
            switchMap((mainRuleset) => {
                const newMainRuleset = cloneDeep(mainRuleset);
                newMainRuleset.data.decisions.delegates[delegateIdx].ruleset.id =
                    newDelegateRulesetRefID;
                if (description !== undefined) {
                    newMainRuleset.data.decisions.delegates[delegateIdx].description = description;
                }
                return this.routingRulesStoreService.commit([
                    { update: { object: { routing_rules: newMainRuleset } } },
                ]);
            }),
        );
    }

    cloneDelegateRuleset({
        mainRulesetRefID,
        delegateIdx,
    }: {
        mainRulesetRefID: number;
        delegateIdx: number;
    }) {
        return combineLatest([
            this.getRuleset(mainRulesetRefID),
            this.getRuleset(mainRulesetRefID).pipe(
                switchMap((r) => this.getRuleset(getDelegate(r, delegateIdx).ruleset.id)),
            ),
            this.nextRefID$,
        ]).pipe(
            take(1),
            switchMap(([mainRuleset, delegateRuleset, nextRefID]) => {
                const newMainRuleset = cloneDeep(mainRuleset);
                getDelegate(newMainRuleset, delegateIdx).ruleset.id = nextRefID;
                const newDelegateRuleset = cloneDeep(delegateRuleset);
                newDelegateRuleset.ref.id = nextRefID;
                return concat(
                    this.routingRulesStoreService.commit([
                        {
                            insert: {
                                object: { routing_rules: newDelegateRuleset.data },
                                force_ref: { routing_rules: newDelegateRuleset.ref },
                            },
                        },
                    ]),
                    this.routingRulesStoreService.commit([
                        { update: { object: { routing_rules: newMainRuleset } } },
                    ]),
                );
            }),
        );
    }

    reload(): void {
        this.routingRulesStoreService.reload();
    }

    private cloneRulesetAndPushDelegate(ruleset: RoutingRulesObject, delegate: RoutingDelegate) {
        const newRuleset = cloneDeep(ruleset);
        if (!Array.isArray(newRuleset.data.decisions.delegates)) {
            newRuleset.data.decisions.delegates = [];
        }
        newRuleset.data.decisions.delegates.push(delegate);
        return newRuleset;
    }

    private cloneRulesetAndPushCandidate(ruleset: RoutingRulesObject, candidate: RoutingCandidate) {
        const newRuleset = cloneDeep(ruleset);
        if (!Array.isArray(newRuleset.data.decisions.candidates)) {
            newRuleset.data.decisions.candidates = [];
        }
        newRuleset.data.decisions.candidates.push(candidate);
        return newRuleset;
    }
}
