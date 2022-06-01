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

import { getPoliciesIdByType } from '@cc/app/sections/payment-routing-rules/utils/get-policies-id-by-type';

import { RoutingRulesService } from '../../../thrift-services';
import { DomainStoreService } from '../../../thrift-services/damsel/domain-store.service';
import { RoutingRulesType } from '../types/routing-rules-type';

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
        private paymentRoutingRulesService: RoutingRulesService
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
                        this.paymentRoutingRulesService
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
