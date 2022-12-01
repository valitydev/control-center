import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
    PartyID,
    PaymentInstitutionObject,
    RoutingDelegate,
    RoutingRulesObject,
} from '@vality/domain-proto';
import { combineLatest, Observable } from 'rxjs';
import { map, pluck, startWith, switchMap } from 'rxjs/operators';

import { DomainStoreService } from '@cc/app/api/deprecated-damsel';

import { RoutingRulesService } from '../services/routing-rules';
import { RoutingRulesType } from '../types/routing-rules-type';
import { getPoliciesIdByType } from '../utils/get-policies-id-by-type';

@Injectable()
export class PartyDelegateRulesetsService {
    private partyID$ = this.route.params.pipe(
        startWith(this.route.snapshot.params),
        pluck('partyID')
    ) as Observable<PartyID>;
    private routingRulesType$ = this.route.params.pipe(
        startWith(this.route.snapshot.params),
        pluck('type')
    ) as Observable<RoutingRulesType>;

    constructor(
        private domainStoreService: DomainStoreService,
        private route: ActivatedRoute,
        private routingRulesService: RoutingRulesService
    ) {}

    getDelegatesWithPaymentInstitution() {
        return combineLatest([this.getPaymentInstitutionsWithRoutingRule(), this.partyID$]).pipe(
            map(([paymentInstitutionsWithRoutingRule, partyID]) =>
                paymentInstitutionsWithRoutingRule
                    .map(({ routingRule: mainRoutingRule, paymentInstitution }) => ({
                        mainRoutingRule,
                        paymentInstitution,
                        delegates: mainRoutingRule?.data?.decisions?.delegates
                            ?.map((d) =>
                                d?.allowed?.condition?.party?.id === partyID ? d : undefined
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
                        []
                    )
            )
        );
    }

    private getPaymentInstitutionsWithRoutingRule() {
        return combineLatest([
            this.domainStoreService.getObjects('payment_institution'),
            this.routingRulesType$,
        ]).pipe(
            switchMap(([paymentInstitutions, routingRulesType]) => {
                return combineLatest(
                    paymentInstitutions.map((paymentInstitution) =>
                        this.routingRulesService
                            .getRuleset(
                                getPoliciesIdByType(paymentInstitution?.data, routingRulesType)
                            )
                            .pipe(
                                map((routingRule) => ({
                                    paymentInstitution,
                                    routingRule,
                                }))
                            )
                    )
                );
            })
        );
    }
}
