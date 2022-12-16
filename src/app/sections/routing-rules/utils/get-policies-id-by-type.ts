import { PaymentInstitution, RoutingRules } from '@vality/domain-proto/domain';
import { PickByValue } from 'utility-types';

import { RoutingRulesType } from '../types/routing-rules-type';

const TYPE_TO_PAYMENT_INSTITUTION_KEY: {
    [N in RoutingRulesType]: keyof PickByValue<PaymentInstitution, RoutingRules>;
} = {
    [RoutingRulesType.Payment]: 'payment_routing_rules',
    [RoutingRulesType.Withdrawal]: 'withdrawal_routing_rules',
};

export function getPoliciesIdByType(
    paymentInstitution: PaymentInstitution,
    type: RoutingRulesType
) {
    return paymentInstitution?.[TYPE_TO_PAYMENT_INSTITUTION_KEY[type]]?.policies?.id;
}
