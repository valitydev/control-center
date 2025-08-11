import { Injectable, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
    PartyID,
    PaymentInstitutionObject,
    RoutingDelegate,
    RoutingRulesObject,
} from '@vality/domain-proto/domain';
import isNil from 'lodash-es/isNil';
import { Observable, combineLatest, of } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';

import { PaymentInstitutionsStoreService } from '../../../../../api/domain-config';
import { RoutingRulesService } from '../services/routing-rules';
import { RoutingRulesType } from '../types/routing-rules-type';
import { getPoliciesIdByType } from '../utils/get-policies-id-by-type';

export interface DelegateWithPaymentInstitution {
    partyDelegate: RoutingDelegate;
    paymentInstitution: PaymentInstitutionObject;
    mainRoutingRule: RoutingRulesObject;
}

@Injectable()
export class PartyDelegateRulesetsService {
    private paymentInstitutionsStoreService = inject(PaymentInstitutionsStoreService);
    private route = inject(ActivatedRoute);
    private routingRulesService = inject(RoutingRulesService);

    private partyID$ = this.route.params.pipe(
        startWith(this.route.snapshot.params),
        map((p) => p['partyID']),
    ) as Observable<PartyID>;
    private routingRulesType$ = this.route.params.pipe(
        startWith(this.route.snapshot.params),
        map((p) => p['type']),
    ) as Observable<RoutingRulesType>;

    getDelegatesWithPaymentInstitution(
        type?: RoutingRulesType,
        partyId?: PartyID,
    ): Observable<DelegateWithPaymentInstitution[]> {
        return combineLatest([
            this.getPaymentInstitutionsWithRoutingRule(type),
            isNil(partyId) ? this.partyID$ : of(partyId),
        ]).pipe(
            map(([paymentInstitutionsWithRoutingRule, partyID]) =>
                paymentInstitutionsWithRoutingRule
                    .map(({ routingRule: mainRoutingRule, paymentInstitution }) => ({
                        mainRoutingRule,
                        paymentInstitution,
                        delegates: mainRoutingRule?.data?.decisions?.delegates
                            ?.map((d) =>
                                d?.allowed?.condition?.party?.id === partyID ? d : undefined,
                            )
                            ?.filter((d) => d),
                    }))
                    .filter(({ delegates }) => delegates?.length)
                    .reduce<
                        {
                            partyDelegate: RoutingDelegate;
                            paymentInstitution: PaymentInstitutionObject;
                            mainRoutingRule: RoutingRulesObject;
                        }[]
                    >(
                        (acc, { delegates, ...rest }) => [
                            ...acc,
                            ...delegates.map((partyDelegate) => ({ ...rest, partyDelegate })),
                        ],
                        [],
                    ),
            ),
        );
    }

    private getPaymentInstitutionsWithRoutingRule(type?: RoutingRulesType) {
        return combineLatest([
            this.paymentInstitutionsStoreService.paymentInstitutions$,
            this.routingRulesType$.pipe(map((routeType) => type ?? routeType)),
        ]).pipe(
            switchMap(([paymentInstitutions, routingRulesType]) => {
                return combineLatest(
                    paymentInstitutions.map((paymentInstitution) =>
                        this.routingRulesService
                            .getRuleset(
                                getPoliciesIdByType(paymentInstitution?.data, routingRulesType),
                            )
                            .pipe(
                                map((routingRule) => ({
                                    paymentInstitution,
                                    routingRule,
                                })),
                            ),
                    ),
                );
            }),
        );
    }
}
