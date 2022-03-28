import { RoutingDelegate, RoutingRulesObject } from '@vality/domain-proto/lib/domain';

export function getDelegate(
    ruleset: RoutingRulesObject,
    delegateIdx: number
): RoutingDelegate | undefined {
    return ruleset?.data?.decisions?.delegates?.[delegateIdx];
}
