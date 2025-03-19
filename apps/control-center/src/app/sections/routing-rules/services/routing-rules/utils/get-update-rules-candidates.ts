import { RoutingCandidate, RoutingRulesObject } from '@vality/domain-proto/domain';
import { UpdateOp } from '@vality/domain-proto/domain_config';
import { cloneDeep } from 'lodash-es';

import { CandidateId } from '../types/candidate-id';

export function getUpdateRulesCandidates(
    rulesets: RoutingRulesObject[],
    candidates: (CandidateId & { newCandidate: RoutingCandidate })[],
): UpdateOp[] {
    const newRulesets = rulesets.map(cloneDeep);
    for (const ruleset of newRulesets) {
        for (const candidate of candidates) {
            if (candidate.refId === ruleset.ref.id) {
                ruleset.data.decisions.candidates.splice(
                    candidate.candidateIdx,
                    1,
                    candidate.newCandidate,
                );
            }
        }
    }
    return rulesets.map((ruleset, idx) => ({
        old_object: { routing_rules: ruleset },
        new_object: { routing_rules: newRulesets[idx] },
    }));
}
