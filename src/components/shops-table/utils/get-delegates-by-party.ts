import { Observable, combineLatest, map, of } from 'rxjs';

import { inject } from '@angular/core';

import {
    DelegateWithPaymentInstitution,
    PartyDelegateRulesetsService,
} from '../../../app/parties/party/routing-rules/party-delegate-rulesets';
import { RoutingRulesType } from '../../../app/parties/party/routing-rules/types/routing-rules-type';

export function getDelegatesByParty(
    parties: string[],
    type: RoutingRulesType,
): Observable<{
    delegatesWithPaymentInstitutionByParty: Map<string, DelegateWithPaymentInstitution[]>;
    rulesetIds: number[];
}> {
    const partyDelegateRulesetsService = inject(PartyDelegateRulesetsService);
    return (
        parties?.length
            ? combineLatest(
                  parties.map((id) =>
                      partyDelegateRulesetsService.getDelegatesWithPaymentInstitution(type, id),
                  ),
              ).pipe(map((rules) => new Map(rules.map((r, idx) => [parties[idx], r]))))
            : of(new Map<string, DelegateWithPaymentInstitution[]>())
    ).pipe(
        map((delegatesWithPaymentInstitutionByParty) => ({
            delegatesWithPaymentInstitutionByParty,
            rulesetIds: Array.from(
                Array.from(delegatesWithPaymentInstitutionByParty.values()).reduce((acc, d) => {
                    d?.map((v) => v?.partyDelegate?.ruleset?.id).forEach((v) => acc.add(v));
                    return acc;
                }, new Set<number>([])),
            ),
        })),
    );
}
