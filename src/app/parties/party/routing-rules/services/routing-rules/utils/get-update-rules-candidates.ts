import { cloneDeep } from 'lodash-es';

import { RoutingCandidate, RoutingRulesObject } from '@vality/domain-proto/domain';
import { UpdateOp } from '@vality/domain-proto/domain_config_v2';

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
    return rulesets.map((_, idx) => ({
        object: { routing_rules: newRulesets[idx] },
    }));
}
