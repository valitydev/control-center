import { Observable, combineLatest, map, of, startWith, switchMap } from 'rxjs';

import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { VersionedObject } from '@vality/domain-proto/domain_config_v2';
import { MenuItem } from '@vality/matez';

import { DomainObjectsStoreService } from '~/api/domain-config';

import { RoutingRulesType } from '../../../app/parties/party/routing-rules-old/types/routing-rules-type';

import { getDelegatesByParty } from './get-delegates-by-party';

export function getDelegatesByPartyItem(
    parties: string[],
    type: RoutingRulesType,
    partyId: string,
    itemId: string,
): Observable<{
    partyRr: MenuItem[];
    itemRr: MenuItem[];
}> {
    const domainStoreService = inject(DomainObjectsStoreService);
    const router = inject(Router);

    return getDelegatesByParty(Array.from(new Set(parties)), type).pipe(
        map((delegatesByParty) =>
            delegatesByParty.rulesetIds
                .map(
                    (id) =>
                        delegatesByParty.delegatesWithPaymentInstitutionByParty
                            ?.get?.(partyId)
                            ?.find?.((v) => v?.partyDelegate?.ruleset?.id === id)?.partyDelegate
                            ?.ruleset,
                )
                .filter(Boolean),
        ),
        switchMap((rulesets) =>
            rulesets?.length
                ? combineLatest(
                      rulesets.map(
                          (ruleset) =>
                              domainStoreService.getObject({
                                  routing_rules: { id: ruleset.id },
                              }).value$,
                      ),
                  )
                : of([] as VersionedObject[]),
        ),
        map((rulesetObjects) => {
            const delegates = rulesetObjects.map(
                (ruleset) =>
                    ruleset?.object?.routing_rules?.data?.decisions?.delegates?.filter?.(
                        (delegate) =>
                            delegate?.allowed?.condition?.party?.party_ref?.id === partyId &&
                            delegate?.allowed?.condition?.party?.definition?.[
                                type === RoutingRulesType.Payment ? 'shop_is' : 'wallet_is'
                            ] === itemId,
                    ) || [],
            );
            const res: {
                partyRr: MenuItem[];
                itemRr: MenuItem[];
            } = {
                partyRr: rulesetObjects.map((ruleset) => {
                    const rr = ruleset.object.routing_rules;
                    return {
                        label: `Party RR  #${rr.ref.id}`,
                        click: () =>
                            router.navigate([
                                '/parties',
                                partyId,
                                'routing-rules',
                                type === RoutingRulesType.Payment ? 'payment' : 'withdrawal',
                                rr.ref.id,
                            ]),
                    };
                }),
                itemRr: rulesetObjects.flatMap((ruleset, idx) => {
                    const rr = ruleset.object.routing_rules;
                    return delegates[idx].length
                        ? delegates[idx].map((delegate) => ({
                              label: `RR #${delegate.ruleset.id}`,
                              click: () =>
                                  router.navigate([
                                      '/parties',
                                      partyId,
                                      'routing-rules',
                                      type === RoutingRulesType.Payment ? 'payment' : 'withdrawal',
                                      rr.ref.id,
                                      'delegate',
                                      delegate.ruleset.id,
                                  ]),
                          }))
                        : [];
                }),
            };
            if (!res.partyRr.length) {
                res.partyRr.push({
                    label: 'No Party RR',
                    disabled: true,
                });
            }
            if (!res.itemRr.length) {
                res.itemRr.push({
                    label: 'No RR',
                    disabled: true,
                });
            }
            return res;
        }),
        startWith({
            partyRr: [
                {
                    label: 'Party RR loading...',
                    disabled: true,
                },
            ],
            itemRr: [
                {
                    label: 'RR loading...',
                    disabled: true,
                },
            ],
        }),
    );
}
